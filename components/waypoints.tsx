import MapLibreGlDirections, {
  LoadingIndicatorControl,
} from "@maplibre/maplibre-gl-directions";
import maplibregl from "maplibre-gl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";

type Cue = {
  order: number;
  road: string;
  distance_m: number;
  duration_s: number;
  maneuver: {
    type?: string;
    modifier?: string;
    location?: [number, number];
  };
  geometry?: GeoJSON.LineString; // 区間ジオメトリ（保存するなら圧縮可）
};

type LngLat = [number, number];

type Suggestion = {
  name: string;
  context: string;
  mapbox_id: string;
};

// セッションごとの一意なトークンを生成・管理するフック
function useSessionToken() {
  const [id, setId] = useState<string>(() => crypto.randomUUID());
  // 入力が変わるたびに更新するのが基本（セッション課金の単位）
  const renew = () => setId(crypto.randomUUID());
  return { id, renew };
}

// 値をデバウンスするカスタムフック
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const Waypoints = () => {
  const { map } = useMap();
  const nativeMap = map?.getMap();
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const directionsRef = useRef<MapLibreGlDirections | null>(null);

  const [q, setQ] = useState("東京駅");
  const dq = useDebounced(q, 160);
  const session = useSessionToken();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [waypoints, setWaypoints] = useState<LngLat[]>([]); // 現在のWPリスト（UI用）

  // 東京駅近傍にバイアス
  const proximity: LngLat = useMemo(() => [139.767, 35.681], []);

  async function suggest(
    q: string,
    session: string,
    opts?: {
      proximity?: LngLat;
      country?: string;
      language?: string;
      limit?: number;
      types?: string;
    }
  ) {
    if (!MAPBOX_TOKEN) return;
    const p = new URLSearchParams({
      q,
      session_token: session,
      access_token: MAPBOX_TOKEN,
      limit: String(opts?.limit ?? 8),
      language: opts?.language ?? "ja",
      country: opts?.country ?? "JP",
      types: opts?.types ?? "address,street,neighborhood,locality,place,poi",
    });
    if (opts?.proximity)
      p.set("proximity", `${opts.proximity[0]},${opts.proximity[1]}`);
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${p}`
    );
    const data = await response.json();
    if (!response.ok) {
      console.warn("Suggest API error:", data);
      return [];
    }
    if (!data.suggestions) {
      console.warn("No suggestions in response:", data);
      return [];
    }
    return (data.suggestions ?? []).map((suggestion: any) => ({
      name: suggestion.name as string,
      context: suggestion.place_formatted as string,
      mapbox_id: suggestion.mapbox_id as string,
    })) as Suggestion[];
  }

  async function retrieve(mapbox_id: string, session: string) {
    if (!MAPBOX_TOKEN) return;
    const p = new URLSearchParams({
      session_token: session,
      access_token: MAPBOX_TOKEN,
    });
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
        mapbox_id
      )}?${p}`
    );
    if (!response.ok) {
      console.warn("Retrieve API error:", await response.text());
      return;
    }
    const data = await response.json();
    const feature = data.features?.[0];
    const coord: LngLat | undefined =
      feature?.properties?.routable_points?.[0]?.point ??
      feature?.geometry?.coordinates;
    const label: string =
      feature?.properties?.name ?? feature?.properties?.place_formatted ?? "";
    return { coord, label };
  }

  // 地名から座標を取得する関数
  async function geocode(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!MAPBOX_TOKEN) return;
    try {
      // Mapbox Geocoding API で1件だけ取得（ja優先）
      const params = new URLSearchParams({
        q: q,
        access_token: MAPBOX_TOKEN,
        language: "ja",
        limit: "1",
        // 住所/地名を主対象に（必要に応じて調整）
        // types: "address,street,place,locality,region,country,block",
      });
      const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Geocoding failed");
      const data = await response.json();
      const feature = data.features?.[0];
      if (!feature) throw new Error("No result");
      const point = feature.geometry.coordinates as [number, number];
      if (!point) throw new Error("No coordinates");
      console.log("Geocoded point:", point);
      directionsRef.current?.addWaypoint(point, 0);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  useEffect(() => {
    if (!nativeMap) return;

    const onLoad = () => {
      // Directionsを一度だけ作る
      const directions = new MapLibreGlDirections(nativeMap, {
        // api: "https://router.project-osrm.org/route/v1",
        api: "https://api.mapbox.com/directions/v5",
        profile: "mapbox/cycling",
        requestOptions: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          geometries: "geojson",
          steps: "true",
          alternatives: "true",
          overview: "full",
        },
      });
      directions.interactive = true;
      nativeMap.addControl(new LoadingIndicatorControl(directions));
      directionsRef.current = directions;

      // ルート取得完了時にレスポンスを受け取る
      const handler = async (e: any) => {
        const resp = e?.data; // MapLibreGlDirectionsRoutingEvent.data
        const route = resp?.routes?.[0];
        if (!route) return;

        // --- キューシート抽出（OSRMのsteps） ---
        const steps = (route.legs ?? []).flatMap((leg: any) => leg.steps ?? []);
        const cues: Cue[] = steps.map((s: any, i: number) => ({
          order: i,
          road: s.name ?? "",
          distance_m: s.distance ?? 0,
          duration_s: s.duration ?? 0,
          maneuver: {
            type: s.maneuver?.type,
            modifier: s.maneuver?.modifier,
            location: s.maneuver?.location,
          },
          geometry: s.geometry, // steps=true & geometries=geojson で入る想定
        }));

        // --- DBへ保存（サンプル）---
        // await fetch("/api/routes", { method: "POST", body: JSON.stringify({ route, cues }) });

        console.log("cues:", cues);
      };

      directions.on("fetchroutesend", handler);

      // クリーンアップ
      return () => {
        directions.off("fetchroutesend", handler);
        directions.destroy(); // レイヤ・ソース・イベントを完全撤去
        directionsRef.current = null;
      };
    };

    if (nativeMap.loaded()) onLoad();
    else nativeMap.once("load", onLoad);
  }, [nativeMap]);

  // サジェスト（入力1つ）
  useEffect(() => {
    (async () => {
      if (!dq) {
        setSuggestions([]);
        return;
      }
      const res = await suggest(dq, session.id, {
        proximity,
        language: "ja",
        country: "JP",
      });
      setSuggestions(res ?? []);
    })().catch(() => setSuggestions([]));
  }, [dq, session.id, proximity]);

  // 候補を選択 → retrieve → addWaypoint
  const pick = async (s: Suggestion) => {
    const result = await retrieve(s.mapbox_id, session.id);
    if (!result) return;
    const { coord, label } = result;
    if (!coord) return;
    const d = directionsRef.current;
    if (!d) return;

    // 既存の末尾に追加
    const index = waypoints.length; // 0,1,2,...
    d.addWaypoint(coord, index);
    setWaypoints((prev) => [...prev, coord]);
    setQ(label || s.name);
    setSuggestions([]);
    // 新しい検索セッションを始める（次の候補入力用）
    session.renew();
  };

  // 末尾のウェイポイントを1つ取り消し
  const undoLast = () => {
    const d = directionsRef.current;
    if (!d || waypoints.length === 0) return;
    const next = waypoints.slice(0, -1);
    setWaypoints(next);
    if (next.length === 0) {
      d.clear(); // すべて消えたらレイヤ/ソースも掃除
    } else if (next.length === 1) {
      d.setWaypoints([next[0]]);
    } else {
      d.setWaypoints(next);
    }
  };

  // 全クリア
  const clearAll = () => {
    directionsRef.current?.clear();
    setWaypoints([]);
    setSuggestions([]);
    setQ("");
    session.renew();
  };

  return (
    <div className="absolute z-10 top-3 left-3 w-[420px] bg-white/90 rounded-xl shadow p-3">
      <div className="text-sm font-medium mb-2">
        経由地を1つずつ追加（Search Box → addWaypoint）
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); /* Enterでもサジェストを待つ */
        }}
      >
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            session.renew();
          }}
          className="border rounded px-3 py-2 w-full"
          placeholder="地名・住所・POI を入力（例: 大手町）"
          autoComplete="off"
        />
      </form>

      {suggestions.length > 0 && (
        <ul className="border rounded mt-2 bg-white max-h-72 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s.mapbox_id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => pick(s)}
            >
              <div className="text-sm">{s.name}</div>
              <div className="text-xs text-gray-500">{s.context}</div>
            </li>
          ))}
        </ul>
      )}

      {/* 追加済みの簡易表示と操作 */}
      <div className="flex items-center gap-2 mt-3">
        <button onClick={undoLast} className="px-2 py-1 rounded border">
          ひとつ戻す
        </button>
        <button onClick={clearAll} className="px-2 py-1 rounded border">
          クリア
        </button>
        <div className="text-xs text-gray-600 ml-auto">
          追加済み: {waypoints.length} 点
        </div>
      </div>
    </div>
  );
};

export { Waypoints };
