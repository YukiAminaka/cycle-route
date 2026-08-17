"use server";

import { apiClient } from "@/lib/api-client";
import { updateUserProfileSchema } from "@/features/users/shema/schema";
import { UpdateUserProfileRequest } from "@/types/api";
import { parseWithZod } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateUserProfile(
  _prevState: unknown,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: updateUserProfileSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, first_name, last_name, description } = submission.value;

  const body: UpdateUserProfileRequest = {
    name,
    first_name: first_name || undefined,
    last_name: last_name || undefined,
    description: description || undefined,
  };

  const cookieStore = await cookies();
  try {
    const { error } = await apiClient.PUT("/users/settings/profile", {
      body,
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    revalidatePath("/settings/profile");

    if (error) {
      return submission.reply({
        formErrors: [error.msg || "プロフィールの更新に失敗しました"],
      });
    }

    return { ...submission.reply(), status: "success" as const };
  } catch {
    return submission.reply({
      formErrors: [
        "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
      ],
    });
  }
}
