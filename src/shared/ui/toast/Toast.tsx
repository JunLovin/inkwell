"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
} from "lucide-react";
import gsap from "gsap";

import { useToastStore } from "@/shared/stores/toast.store";
import type { Toast, ToastVariant } from "@/shared/types/toast.types";
import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";

const DEFAULT_DURATION = 4000;

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ReactNode;
    bar: string;
    container: string;
    title: string;
    description: string;
  }
> = {
  default: {
    icon: <Bell size={15} />,
    bar: "bg-zinc-500",
    container: "bg-zinc-900 border-zinc-700/80 text-zinc-400",
    title: "text-zinc-200",
    description: "text-zinc-500",
  },
  success: {
    icon: <CheckCircle2 size={15} />,
    bar: "bg-emerald-500",
    container: "bg-zinc-900 border-emerald-900/60 text-emerald-400",
    title: "text-zinc-200",
    description: "text-zinc-500",
  },
  danger: {
    icon: <AlertCircle size={15} />,
    bar: "bg-red-500",
    container: "bg-zinc-900 border-red-900/60 text-red-400",
    title: "text-zinc-200",
    description: "text-zinc-500",
  },
  warning: {
    icon: <AlertTriangle size={15} />,
    bar: "bg-amber-500",
    container: "bg-zinc-900 border-amber-900/60 text-amber-400",
    title: "text-zinc-200",
    description: "text-zinc-500",
  },
  info: {
    icon: <Info size={15} />,
    bar: "bg-blue-500",
    container: "bg-zinc-900 border-blue-900/60 text-blue-400",
    title: "text-zinc-200",
    description: "text-zinc-500",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const variant = toast.variant ?? "default";
  const config = variantConfig[variant];
  const duration = toast.duration ?? DEFAULT_DURATION;

  const handleRemove = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      x: 40,
      opacity: 0,
      filter: "blur(4px)",
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => remove(toast.id),
    });
  };

  useEffect(() => {
    const el = ref.current;
    const bar = barRef.current;
    if (!el || !bar) return;

    const tl = gsap.timeline();

    tl.fromTo(
      el,
      { x: 40, opacity: 0, filter: "blur(4px)" },
      {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
      },
    ).fromTo(
      bar,
      { scaleX: 1 },
      { scaleX: 0, duration: duration / 1000, ease: "none" },
      "-=0.1",
    );

    const exitTimer = setTimeout(handleRemove, duration);

    return () => {
      clearTimeout(exitTimer);
      tl.kill();
    };
  }, [duration]);

  const isAssertive = variant === "danger" || variant === "warning";

  return (
    <div
      ref={ref}
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
      className={`
        relative flex items-start gap-3 w-80 rounded-2xl border px-4 py-3.5
        shadow-xl shadow-black/40 overflow-hidden
        ${config.container}
      `}
    >
      <div
        ref={barRef}
        className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${config.bar}`}
      />

      <span className="shrink-0 mt-0.5">{config.icon}</span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${config.title}`}>
          {toast.title}
        </p>
        {toast.description && (
          <p className={`text-xs mt-0.5 leading-relaxed ${config.description}`}>
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleRemove}
        aria-label="Dismiss notification"
        className="shrink-0 mt-0.5 text-zinc-600 hover:text-zinc-400 transition-colors duration-150 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const mounted = usePortalMounted();

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2.5 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  );
}
