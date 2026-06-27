"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";

import { Button, Field, Input } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../schemas/reset-password.schema";
import { useAuthActions } from "../../infrastructure/hooks/use-auth";

export function ResetPasswordPage() {
  const { confirmPasswordReset } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  const initialEmail = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
        )
        .fromTo(
          formRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4",
        )
        .fromTo(
          footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.3",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await confirmPasswordReset({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });
      toast.success({
        title: "Password updated",
        description: "Sign in with your new password.",
      });
      router.push("/login");
    } catch {
      toast.error({
        title: "Could not reset password",
        description: "Check the code and try again.",
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-8">
      <div ref={headingRef}>
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5">
          <Lock size={20} className="text-zinc-300" />
        </div>
        <h2 className="text-white text-2xl font-light tracking-tight">
          Set a new password
        </h2>
        <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
          Enter the 6-digit code we sent to your email and pick a new password.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Input
          {...register("email")}
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
        />

        <Field label="Verification code" error={errors.code?.message}>
          <Input
            {...register("code")}
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            autoComplete="one-time-code"
          />
        </Field>

        <Input
          {...register("newPassword")}
          label="New password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.newPassword?.message}
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <Input
          {...register("confirmPassword")}
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={
                showConfirm ? "Hide confirmation" : "Show confirmation"
              }
              className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          icon={!isSubmitting ? <ArrowRight size={15} /> : undefined}
          iconPosition="right"
          className="w-full mt-2"
        >
          Update password
        </Button>
      </form>

      <p ref={footerRef} className="text-center text-zinc-600 text-xs">
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-zinc-500 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={12} />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
