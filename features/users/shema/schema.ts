import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(1, "表示名は必須です")
    .max(50, "表示名は50文字以内で入力してください"),
  first_name: z
    .string()
    .max(50, "名は50文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string()
    .max(50, "姓は50文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "自己紹介は500文字以内で入力してください")
    .optional()
    .or(z.literal("")),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
