"use client";

import { Button } from "@/components/ui/button";
import { getMapboxStaticPinImageUrl } from "@/services/mapbox";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { LocationEditDialog } from "./location-edit-dialog";

type LocationSettingsProps = {
  location: string; // geojson point
};

const DEFAULT_LOCATION = { longitude: 139.753, latitude: 35.6844 };

export function LocationSettings({ location }: LocationSettingsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const homeLocation = useMemo(() => {
    if (location) {
      try {
        const features = JSON.parse(location);
        const point = features.features[0].geometry;
        return {
          longitude: point.coordinates[0] as number,
          latitude: point.coordinates[1] as number,
        };
      } catch {
        // fallback
      }
    }
    return DEFAULT_LOCATION;
  }, [location]);

  const mapImageUrl = getMapboxStaticPinImageUrl(
    homeLocation.longitude,
    homeLocation.latitude,
    { width: 736, height: 414 },
  );

  return (
    <div className="flex-1 p-8 max-w-200">
      <div>
        <h1 className="text-3xl font-medium mb-2">位置情報</h1>
        <p className="text-muted-foreground mb-8">
          ルートプランナーのデフォルトの位置を設定
        </p>
      </div>
      <div className="relative w-full aspect-video overflow-hidden border group">
        <Image
          src={mapImageUrl}
          alt="デフォルトの位置プレビュー"
          fill
          className="object-cover"
          unoptimized
        />
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setDialogOpen(true)}
        >
          <Pencil className="w-4 h-4 mr-1" />
          編集
        </Button>
      </div>

      <LocationEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialLongitude={homeLocation.longitude}
        initialLatitude={homeLocation.latitude}
      />
    </div>
  );
}
