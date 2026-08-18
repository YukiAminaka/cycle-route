import ExploreRoutes from "@/features/routes/components/explore-routes";

export default async function ExplorePage() {
  return (
    <div className="relative h-full w-full flex">
      <div className="flex-1 relative">
        <ExploreRoutes />
      </div>
    </div>
  );
}
