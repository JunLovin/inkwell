"use client";

import { ArrowRight, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";

import { Button, Input } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuthActions } from "../../infrastructure/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "../schemas/forgot-password.schema";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuthActions();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
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

  useEffect(() => {
    if (!submitted || !successRef.current) return;

    gsap.fromTo(
      successRef.current,
      { opacity: 0, scale: 0.96, filter: "blur(4px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power3.out",
      },
    );
  }, [submitted]);

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await requestPasswordReset(data.email);
      setSentTo(data.email);
      setSubmitted(true);
    } catch {
      toast.error({
        title: "Could not send reset email",
        description: "Check the address and try again.",
      });
    }
  };

  if (submitted) {
    return (
      <div ref={successRef} className="w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <MailCheck size={24} className="text-zinc-300" />
          </div>

          <div className="space-y-2">
            <h2 className="text-white text-2xl font-light tracking-tight">
              Check your inbox
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
              We sent a password reset link to{" "}
              <span className="text-zinc-300">{sentTo}</span>. It expires in 15
              minutes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href={`/reset-password?email=${encodeURIComponent(sentTo)}`}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium py-3.5 transition-colors duration-200"
          >
            I have the code
            <ArrowRight size={15} />
          </Link>

          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Try a different email
          </Button>

          <p className="text-center text-zinc-600 text-xs">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-zinc-400 hover:text-white transition-colors duration-200 underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
            >
              resend
            </button>
          </p>
        </div>

        <p className="text-center text-zinc-600 text-xs">
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

  return (
    <div ref={containerRef} className="w-full space-y-8">
      <div ref={headingRef}>
        <h2 className="text-white text-2xl font-light tracking-tight">
          Forgot password?
        </h2>
        <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
          Enter your email and we&apos;ll send you a reset link
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

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          icon={!isSubmitting ? <ArrowRight size={15} /> : undefined}
          iconPosition="right"
          className="w-full mt-2"
        >
          Send reset link
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
