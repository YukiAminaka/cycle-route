"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile } from "@/features/users/actions/edit-userprofile";
import { updateUserProfileSchema } from "@/features/users/shema/schema";
import { useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Camera } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileSettingsProps {
  defaultValues: {
    name: string;
    first_name: string;
    last_name: string;
    description: string;
  };
}

export function ProfileSettings({ defaultValues }: ProfileSettingsProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastResult, action, isPending] = useActionState(
    updateUserProfile,
    null
  );

  const [form, fields] = useForm({
    constraint: getZodConstraint(updateUserProfileSchema),
    lastResult,
    defaultValue: defaultValues,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateUserProfileSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success("プロフィールを更新しました");
    } else if (lastResult?.status === "error") {
      const errorMessage =
        form.errors?.[0] || "プロフィールの更新中にエラーが発生しました";
      toast.error(errorMessage);
    }
  }, [lastResult, form.errors]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-[800px]">
      <div>
        <h1 className="text-3xl font-medium mb-2">プロフィール</h1>
        <p className="text-muted-foreground mb-8">
          ログインとプロフィールの詳細を変更。
        </p>
      </div>

      <form id={form.id} onSubmit={form.onSubmit} action={action}>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>プロフィール画像</Label>
            <div className="relative inline-block">
              <Avatar className="size-24">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  Y
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="size-3.5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.name.id}>表示名</Label>
            <Input
              id={fields.name.id}
              name={fields.name.name}
              key={fields.name.key}
              defaultValue={fields.name.initialValue}
              aria-invalid={!!fields.name.errors}
            />
            {fields.name.errors && (
              <p className="text-sm text-red-500">{fields.name.errors[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.first_name.id}>名</Label>
            <Input
              id={fields.first_name.id}
              name={fields.first_name.name}
              key={fields.first_name.key}
              defaultValue={fields.first_name.initialValue}
              aria-invalid={!!fields.first_name.errors}
            />
            {fields.first_name.errors && (
              <p className="text-sm text-red-500">
                {fields.first_name.errors[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.last_name.id}>姓</Label>
            <Input
              id={fields.last_name.id}
              name={fields.last_name.name}
              key={fields.last_name.key}
              defaultValue={fields.last_name.initialValue}
              aria-invalid={!!fields.last_name.errors}
            />
            {fields.last_name.errors && (
              <p className="text-sm text-red-500">
                {fields.last_name.errors[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fields.description.id}>自己紹介</Label>
            <Textarea
              id={fields.description.id}
              name={fields.description.name}
              key={fields.description.key}
              defaultValue={fields.description.initialValue}
              rows={4}
              aria-invalid={!!fields.description.errors}
            />
            {fields.description.errors && (
              <p className="text-sm text-red-500">
                {fields.description.errors[0]}
              </p>
            )}
          </div>

          {form.errors && (
            <p className="text-sm text-red-500">{form.errors[0]}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "保存中..." : "変更を保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
