"use server";

import { apiClient } from "@/lib/api-client";
import { RouteListResponse } from "@/types/api";
import { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cookies } from "next/headers";
import { exploreRoutesSchema } from "../types/schema";

export type ExploreRoutesState = {
  submission: SubmissionResult<string[]> | null;
  data: RouteListResponse | null;
};

export async function exploreRoutes(
  _prevState: ExploreRoutesState | null,
  formData: FormData
): Promise<ExploreRoutesState> {
  // フォームデータのバリデーション
  const submission = parseWithZod(formData, {
    schema: exploreRoutesSchema,
  });

  // バリデーションエラーがある場合
  if (submission.status !== "success") {
    return {
      submission: submission.reply(),
      data: _prevState?.data ?? null,
    };
  }

  const searchParams = submission.value;
  const cookieStore = await cookies();

  try {
    // クエリパラメータを構築
    const query: {
      q?: string;
      lat?: number;
      lng?: number;
      r?: number;
      min_distance?: number;
      max_distance?: number;
      offset?: number;
    } = {};

    if (searchParams.q) {
      query.q = searchParams.q;
    }
    if (searchParams.lat !== undefined) {
      query.lat = searchParams.lat;
    }
    if (searchParams.lng !== undefined) {
      query.lng = searchParams.lng;
    }
    if (searchParams.r !== undefined) {
      query.r = searchParams.r;
    }
    if (searchParams.min_distance !== undefined) {
      query.min_distance = searchParams.min_distance;
    }
    if (searchParams.max_distance !== undefined) {
      query.max_distance = searchParams.max_distance;
    }
    if (searchParams.offset !== undefined) {
      query.offset = searchParams.offset;
    }

    const { data, error } = await apiClient.GET("/routes/explore", {
      params: {
        query,
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    if (error) {
      return {
        submission: submission.reply({
          formErrors: ["検索に失敗しました"],
        }),
        data: _prevState?.data ?? null,
      };
    }

    return {
      submission: submission.reply(),
      data,
    };
  } catch {
    return {
      submission: submission.reply({
        formErrors: ["検索中にエラーが発生しました"],
      }),
      data: _prevState?.data ?? null,
    };
  }
}
