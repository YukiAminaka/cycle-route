"use server";

import { apiClient } from "@/lib/api-client";
import { UpdateUserLocationRequest } from "@/types/api";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type UpdateLocationInput = {
  longitude: number;
  latitude: number;
  country_code: string;
  administrative_area: string;
  locality: string;
  postal_code: string;
};

export type UpdateLocationResult =
  | { success: true }
  | { success: false; error: string };

export async function updateUserLocation(
  input: UpdateLocationInput
): Promise<UpdateLocationResult> {
  const geom = JSON.stringify({
    type: "Point",
    coordinates: [input.longitude, input.latitude],
  });

  const body: UpdateUserLocationRequest = {
    geom,
    country_code: input.country_code,
    administrative_area: input.administrative_area,
    locality: input.locality,
    postal_code: input.postal_code,
  };

  const cookieStore = await cookies();
  try {
    const { error } = await apiClient.PUT("/users/settings/location", {
      body,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (error) {
      return { success: false, error: (error as { msg?: string }).msg || "位置情報の更新に失敗しました" };
    }

    revalidatePath("/settings/location");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
    };
  }
}
