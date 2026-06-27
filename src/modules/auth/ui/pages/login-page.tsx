"use client";

import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { useRouter } from "next/navigation";

import { loginSchema, type LoginSchema } from "../schemas/login.schema";
import { Button, Divider, Input, Field } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useAuthActions,
  useAuthSession,
} from "../../infrastructure/hooks/use-auth";

export function LoginPage() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const oauthRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
          [dividerRef.current, oauthRef.current],
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4",
        )
        .fromTo(
          footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.2",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async (data: LoginSchema) => {
    try {
      await signIn({ email: data.email, password: data.password });

      toast.success({
        title: "Login successful",
        description: "Welcome back!",
      });
      router.push("/dashboard");
    } catch {
      toast.error({
        title: "Login failed",
        description: "Check your credentials or try again later",
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-8">
      <div ref={headingRef}>
        <h2 className="text-white text-2xl font-light tracking-tight">
          Welcome back
        </h2>
        <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
          Sign in to continue to your workspace
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          action={
            <Link
              href="/forgot-password"
              className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors duration-200"
            >
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            {...register("flow")}
            name="flow"
            type="hidden"
            value="signIn"
          />
        </Field>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer relative rounded-2xl py-3.5 text-sm font-medium tracking-wide transition-all duration-300 overflow-hidden group mt-2 border border-zinc-700 bg-gradient-to-br from-zinc-700 to-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          <span className="relative flex items-center justify-center gap-2 text-white">
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </>
            )}
          </span>
        </Button>
      </form>

      <div ref={dividerRef} className="flex items-center gap-4">
        <Divider />
        <span className="text-zinc-700 text-xs tracking-widest uppercase">
          or
        </span>
        <Divider />
      </div>

      <div ref={oauthRef} className="space-y-3">
        <button
          type="button"
          disabled
          aria-label="Continue with Google — coming soon"
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/20 text-zinc-500 text-sm py-3.5 opacity-50 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
          <span className="text-[10px] tracking-wide uppercase text-zinc-600 border border-zinc-700/60 rounded-full px-2 py-0.5">
            soon
          </span>
        </button>

        <button
          type="button"
          disabled
          aria-label="Continue with GitHub — coming soon"
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/20 text-zinc-500 text-sm py-3.5 opacity-50 cursor-not-allowed"
        >
          Continue with GitHub
          <span className="text-[10px] tracking-wide uppercase text-zinc-600 border border-zinc-700/60 rounded-full px-2 py-0.5">
            soon
          </span>
        </button>
      </div>

      <p ref={footerRef} className="text-center text-zinc-600 text-xs">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-zinc-400 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
