"use client";

import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";

import { Button, Divider, Input } from "@/shared/components/ui";
import {
  registerSchema,
  RegisterSchema,
} from "@/shared/schemas/register.schema";
import { useAuthActions } from "@convex-dev/auth/react";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await signIn("password", {
        email: data.email,
        name: data.name,
        password: data.password,
        flow: data.flow,
      });
      toast.success("Account created successfully! You are now signed in.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create account. Please try again.");
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-8">
      <div ref={headingRef}>
        <h2 className="text-white text-2xl font-light tracking-tight">
          Create an account
        </h2>
        <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
          Start writing smarter with Inkwell
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Input
          {...register("name")}
          label="Full name"
          placeholder="John Doe"
          error={errors.name?.message}
          autoComplete="name"
        />

        <Input
          {...register("email")}
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
        />

        <Input
          {...register("password")}
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 cursor-pointer"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <input {...register("flow")} name="flow" type="hidden" value="signUp" />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          icon={!isSubmitting ? <ArrowRight size={15} /> : undefined}
          iconPosition="right"
          className="w-full mt-2"
        >
          Create account
        </Button>
      </form>

      <div ref={dividerRef}>
        <Divider label="or" />
      </div>

      <div ref={oauthRef} className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300 text-sm py-3.5 transition-all duration-300"
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
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300 text-sm py-3.5 transition-all duration-300"
        >
          Continue with GitHub
        </button>
      </div>

      <p ref={footerRef} className="text-center text-zinc-600 text-xs">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-zinc-400 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
