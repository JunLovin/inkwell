"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import gsap from "gsap";
import type { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";
import { useFocusTrap } from "@/shared/hooks/use-focus-trap";

export type DialogAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: DialogAction[];
  size?: "sm" | "md" | "lg" | "xl" | "full";
  bare?: boolean;
};

const sizeStyles: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-3xl",
  full: "max-w-5xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = "md",
  bare = false,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = usePortalMounted();
  useFocusTrap(panelRef, open);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    if (open) {
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      );
      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.95, y: 16, filter: "blur(6px)" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.35,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(panel, {
        opacity: 0,
        scale: 0.96,
        y: 8,
        filter: "blur(4px)",
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
        },
      });
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] items-center justify-center px-4"
      style={{ display: "none", opacity: 0 }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`
          w-full ${sizeStyles[size]} bg-zinc-900 border border-zinc-800
          rounded-2xl shadow-2xl shadow-black/60 overflow-hidden
          ${bare ? "" : ""}
        `}
      >
        {!bare && (title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
            <div>
              {title && (
                <h3 className="text-white text-base font-medium tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer ml-4 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {!bare && <div className="px-6 py-4">{children}</div>}

        {bare && children}

        {!bare && actions && actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-800">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "secondary"}
                size="sm"
                loading={action.loading}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
