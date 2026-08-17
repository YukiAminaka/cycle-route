"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUserLocation } from "@/features/users/actions/edit-user-location";
import { mapboxReverseGeocode } from "@/services/mapbox";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import Map, { Marker } from "react-map-gl/maplibre";

const MAPTILER_TOKEN = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
const MAP_STYLE =
  "https://api.maptiler.com/maps/base-v4/style.json?key=" + MAPTILER_TOKEN;

type LocationInfo = {
  longitude: number;
  latitude: number;
  country_code: string;
  administrative_area: string;
  locality: string;
  postal_code: string;
};

type LocationEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLongitude: number;
  initialLatitude: number;
};

export function LocationEditDialog({
  open,
  onOpenChange,
  initialLongitude,
  initialLatitude,
}: LocationEditDialogProps) {
  const [location, setLocation] = useState<LocationInfo>({
    longitude: initialLongitude,
    latitude: initialLatitude,
    country_code: "",
    administrative_area: "",
    locality: "",
    postal_code: "",
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleMapClick = useCallback(async (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setIsGeocoding(true);
    setError(null);
    try {
      const result = await mapboxReverseGeocode(lng, lat);
      setLocation({
        longitude: lng,
        latitude: lat,
        country_code: result?.country_code ?? "",
        administrative_area: result?.administrative_area ?? "",
        locality: result?.locality ?? "",
        postal_code: result?.postal_code ?? "",
      });
    } catch {
      setLocation((prev) => ({ ...prev, longitude: lng, latitude: lat }));
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await updateUserLocation(location);
      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }, [location, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>デフォルト位置を設定</DialogTitle>
          <DialogDescription>
            地図をクリックして位置を設定してください
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-80">
          <Map
            mapStyle={MAP_STYLE}
            initialViewState={{
              longitude: initialLongitude,
              latitude: initialLatitude,
              zoom: 13,
            }}
            onClick={handleMapClick}
            style={{ width: "100%", height: "100%" }}
            cursor="crosshair"
          >
            <Marker longitude={location.longitude} latitude={location.latitude}>
              <MapPin
                className="w-8 h-8 text-red-500 -translate-y-full"
                fill="currentColor"
                strokeWidth={1}
              />
            </Marker>
          </Map>
          {isGeocoding && (
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center pointer-events-none">
              <span className="text-sm text-muted-foreground animate-pulse">
                住所を取得中...
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Row label="国コード" value={location.country_code} />
            <Row label="都道府県" value={location.administrative_area} />
            <Row label="市区町村" value={location.locality} />
            <Row label="郵便番号" value={location.postal_code} />
            <Row label="緯度" value={location.latitude.toFixed(6)} />
            <Row label="経度" value={location.longitude.toFixed(6)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isPending || isGeocoding}>
            {isPending ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="font-medium truncate">{value || "—"}</span>
    </div>
  );
}
