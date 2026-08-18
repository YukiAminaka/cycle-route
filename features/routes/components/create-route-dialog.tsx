"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { createRoute } from "@/features/routes/actions/create-route";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  coursePointsType,
  createRouteFormSchema,
  waypointsType,
} from "../types/schema";

interface CreateRouteDialogProps {
  routeName: string;
  waypoints: waypointsType;
  coursePoints: coursePointsType;
  routeInfo: {
    distance: number;
    duration: number;
    elevation_gain: number;
    elevation_loss: number;
    path_geom: string;
    first_point: string;
    last_point: string;
  } | null;
}

export function CreateRouteDialog({
  routeName,
  waypoints,
  coursePoints,
  routeInfo,
}: CreateRouteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // 追加引数をbindしたactionを作成
  const boundCreateRoute = useMemo(() => {
    const defaultRouteInfo = {
      distance: 0,
      duration: 0,
      elevation_gain: 0,
      elevation_loss: 0,
      path_geom: "",
      first_point: "",
      last_point: "",
    };
    return createRoute.bind(
      null,
      waypoints,
      coursePoints,
      routeInfo ?? defaultRouteInfo
    );
  }, [waypoints, coursePoints, routeInfo]);

  // useActionState を使って Action を接続
  const [lastResult, action, isPending] = useActionState(
    boundCreateRoute,
    null
  );

  // useForm を使ってフォーム状態を管理
  const [form, fields] = useForm({
    constraint: getZodConstraint(createRouteFormSchema), // zodのスキーマに応じてConformがHTMLのバリデーション属性を自動的に付与してくれるオプション
    lastResult, // server actionsの結果が返却される
    // クライアント側でのバリデーションをする
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createRouteFormSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      // 成功時にトーストを表示してダッシュボードに遷移（ダイアログは派生状態で閉じる）
      toast.success("ルートが正常に保存されました");
      router.push("/dashboard");
    } else if (lastResult?.status === "error") {
      // エラー時はトーストでエラーメッセージを表示（ダイアログは閉じない）
      const errorMessage =
        form.errors?.[0] || "ルートの保存中にエラーが発生しました";
      toast.error(errorMessage);
    }
  }, [lastResult, form.errors, router]);

  // 成功時はダイアログを閉じる（派生状態）
  const effectiveOpen = open && lastResult?.status !== "success";

  return (
    <Dialog open={effectiveOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-medium h-11"
          disabled={!routeInfo}
        >
          保存
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form id={form.id} onSubmit={form.onSubmit} action={action}>
          <DialogHeader>
            <DialogTitle>ルート保存</DialogTitle>
            <DialogDescription>
              ルートのタイトルと説明を入力してください。
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="routeName">タイトル</Label>
              <Input
                id="routeName"
                name="name"
                key={fields.name.key}
                defaultValue={routeName}
                aria-invalid={!!fields.name.errors}
              />
              {fields.name.errors && (
                <p className="text-sm text-red-500">{fields.name.errors[0]}</p>
              )}
            </Field>
            <Field>
              <Label htmlFor="visibility">公開範囲</Label>
              <RadioGroup
                name={fields.visibility.name}
                key={fields.visibility.key}
                defaultValue="1"
                aria-invalid={!!fields.visibility.errors}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="public" />
                  <Label
                    htmlFor="public"
                    className="font-normal cursor-pointer"
                  >
                    公開
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="private" />
                  <Label
                    htmlFor="private"
                    className="font-normal cursor-pointer"
                  >
                    非公開
                  </Label>
                </div>
              </RadioGroup>
              {fields.visibility.errors && (
                <p className="text-sm text-red-500">
                  {fields.visibility.errors[0]}
                </p>
              )}
            </Field>
            <Field>
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                name="description"
                key={fields.description.key}
              />
            </Field>
          </FieldGroup>

          {form.errors && (
            <p className="text-sm text-red-500 mt-2">{form.errors[0]}</p>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending || !routeInfo}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
