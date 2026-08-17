import { RoutePlannerWrapper } from "@/features/routes/components/route-planner-wrapper";
import { getLoggedInUserInfo } from "@/features/users/fetcher/login-user-info";

export default async function NewRoutePage() {
  const { data } = await getLoggedInUserInfo();

  const initialLocation: { longitude: number; latitude: number } | null =
    (() => {
      try {
        const geojsonPoint = data?.user?.geom
          ? JSON.parse(data.user.geom)
          : null;
        if (!geojsonPoint?.features || geojsonPoint.features.length === 0)
          return null;
        const geom = geojsonPoint.features[0].geometry;
        if (!geom) return null;
        return {
          longitude: geom.coordinates[0] as number,
          latitude: geom.coordinates[1] as number,
        };
      } catch {
        return null;
      }
    })();

  return (
    <div className="relative h-full w-full flex">
      <div className="flex-1 relative">
        <RoutePlannerWrapper initialLocation={initialLocation} />
      </div>
    </div>
  );
}
