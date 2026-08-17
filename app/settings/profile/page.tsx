import { getLoggedInUserInfo } from "@/features/users/fetcher/login-user-info";
import { ProfileSettings } from "./profileSettings";

export default async function ProfilePage() {
  const { data } = await getLoggedInUserInfo();

  return (
    <ProfileSettings
      defaultValues={{
        name: data?.user?.name ?? "",
        first_name: data?.user?.first_name ?? "",
        last_name: data?.user?.last_name ?? "",
        description: data?.user?.description ?? "",
      }}
    />
  );
}
