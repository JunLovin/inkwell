"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Card, Input } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "../../schemas/change-password.schema";

export function AccountSection() {
  const { toast } = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (_data: ChangePasswordSchema) => {
    toast.default({
      title: "Password change is rolling out",
      description:
        "For now, use \"Forgot password\" from the sign-in screen to set a new one.",
    });
    reset();
  };

  return (
    <Card variant="default" padding="lg">
      <div className="space-y-5">
        <div>
          <h3 className="text-white text-sm font-medium tracking-tight">
            Change password
          </h3>
          <p className="text-zinc-600 text-xs mt-1">
            Update the password used to sign into Inkwell.
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <ShieldAlert size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-200/80 leading-relaxed">
            In-app password change is rolling out. For now, use{" "}
            <Link
              href="/forgot-password"
              className="text-amber-300 underline underline-offset-4 decoration-amber-700/60 hover:decoration-amber-400"
            >
              Forgot password
            </Link>{" "}
            from the sign-in screen.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("currentPassword")}
            label="Current password"
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            {...register("newPassword")}
            label="New password"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            error={errors.newPassword?.message}
            autoComplete="new-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            {...register("confirmPassword")}
            label="Confirm new password"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              icon={!isSubmitting ? <ArrowRight size={14} /> : undefined}
              iconPosition="right"
            >
              Update password
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
