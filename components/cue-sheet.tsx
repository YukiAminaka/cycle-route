"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CornerUpRight,
  CornerDownRight,
  MoveUp,
  RotateCcw,
  Flag,
} from "lucide-react";
import { Cue } from "@/types/route";
import { Badge } from "@/components/ui/badge";

interface CueSheetProps {
  cues: Cue[];
  routeName?: string;
  totalDistance?: number;
  totalDuration?: number;
}

/**
 * Get icon component based on maneuver type and modifier
 */
const getManeuverIcon = (maneuver?: { type?: string; modifier?: string }) => {
  if (!maneuver?.type) return <ArrowRight className="h-5 w-5" />;

  const { type, modifier } = maneuver;

  // Handle different maneuver types
  switch (type) {
    case "depart":
      return <Flag className="h-5 w-5 text-green-600" />;
    case "arrive":
      return <Flag className="h-5 w-5 text-red-600" />;
    case "turn":
      if (modifier?.includes("right")) {
        if (modifier === "sharp right") {
          return <CornerUpRight className="h-5 w-5" />;
        }
        return <ArrowUpRight className="h-5 w-5" />;
      }
      if (modifier?.includes("left")) {
        if (modifier === "sharp left") {
          return <CornerDownRight className="h-5 w-5 rotate-180" />;
        }
        return <ArrowDownRight className="h-5 w-5 rotate-180" />;
      }
      return <ArrowRight className="h-5 w-5" />;
    case "rotary":
    case "roundabout":
      return <RotateCcw className="h-5 w-5" />;
    case "continue":
      return <MoveUp className="h-5 w-5" />;
    default:
      return <ArrowRight className="h-5 w-5" />;
  }
};

/**
 * Get Japanese instruction text based on maneuver
 */
const getManeuverText = (maneuver?: {
  type?: string;
  modifier?: string;
}): string => {
  if (!maneuver?.type) return "直進";

  const { type, modifier } = maneuver;

  switch (type) {
    case "depart":
      return "出発";
    case "arrive":
      return "到着";
    case "turn":
      if (modifier === "sharp right") return "鋭角右折";
      if (modifier === "right") return "右折";
      if (modifier === "slight right") return "右方向";
      if (modifier === "sharp left") return "鋭角左折";
      if (modifier === "left") return "左折";
      if (modifier === "slight left") return "左方向";
      if (modifier === "straight") return "直進";
      return "曲がる";
    case "continue":
      return "直進を継続";
    case "merge":
      return "合流";
    case "rotary":
    case "roundabout":
      return "ロータリー";
    case "exit roundabout":
      return "ロータリーを出る";
    case "fork":
      return "分岐";
    default:
      return modifier || "進む";
  }
};

/**
 * Format distance in meters to km
 */
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration in seconds to readable time
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
};

/**
 * Calculate cumulative distance up to a specific cue
 */
const getCumulativeDistance = (cues: Cue[], index: number): number => {
  return cues.slice(0, index + 1).reduce((sum, cue) => sum + cue.distance_m, 0);
};

export function CueSheet({
  cues,
  totalDistance,
  totalDuration,
}: CueSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate totals if not provided
  const calcTotalDistance =
    totalDistance ?? cues.reduce((sum, cue) => sum + cue.distance_m, 0);
  const calcTotalDuration =
    totalDuration ?? cues.reduce((sum, cue) => sum + cue.duration_s, 0);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {formatDistance(calcTotalDistance)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatDuration(calcTotalDuration)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {cues.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            ルートが選択されていません
          </div>
        ) : (
          <>
            {/* Start Point */}
            {cues[0] && (
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {getManeuverText(cues[0].maneuver)}
                  </div>
                  {cues[0].road && (
                    <div className="text-xs text-muted-foreground truncate">
                      {cues[0].road}
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistance(getCumulativeDistance(cues, 0))}
                </span>
              </div>
            )}

            {/* Collapsible Section for middle steps */}
            {cues.length > 2 && (
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b"
                >
                  <span className="text-sm text-muted-foreground">
                    {cues.length - 2} ステップ
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-0">
                    {cues.slice(1, -1).map((cue, idx) => {
                      const actualIndex = idx + 1;
                      const cumulativeDistance = getCumulativeDistance(
                        cues,
                        actualIndex
                      );
                      const Icon = getManeuverIcon(cue.maneuver);

                      return (
                        <div
                          key={cue.order}
                          className="flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-foreground">
                            {Icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground">
                              {getManeuverText(cue.maneuver)}
                            </div>
                            {cue.road && (
                              <div className="text-xs text-muted-foreground truncate">
                                {cue.road}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {formatDistance(cumulativeDistance)}
                            </div>
                            {cue.distance_m > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +{formatDistance(cue.distance_m)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* End Point */}
            {cues.length > 1 && cues[cues.length - 1] && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white">
                  <Square className="h-5 w-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {getManeuverText(cues[cues.length - 1].maneuver)}
                  </div>
                  {cues[cues.length - 1].road && (
                    <div className="text-xs text-muted-foreground truncate">
                      {cues[cues.length - 1].road}
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistance(getCumulativeDistance(cues, cues.length - 1))}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
