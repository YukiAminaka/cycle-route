import { getLoggedInUserInfo } from "@/features/users/fetcher/login-user-info";
import { LocationSettings } from "./locationSettings";

export default async function LocationPage() {
  const { data } = await getLoggedInUserInfo();

  return <LocationSettings location={data?.user?.geom || ""} />;
}
