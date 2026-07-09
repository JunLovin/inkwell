"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2 } from "lucide-react";
import gsap from "gsap";
import type { ReactNode } from "react";

import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";
import { useFocusTrap } from "@/shared/hooks/use-focus-trap";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  onExpand?: () => void;
  expandLabel?: string;
  actions?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Drawer({
  open,
  onClose,
  title,
  onExpand,
  expandLabel = "Open full note",
  actions,
  children,
  size = "md",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const mounted = usePortalMounted();
  useFocusTrap(panelRef, open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    gsap.killTweensOf([overlay, panel]);

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(overlay, { display: "flex" });
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power2.out" },
        );
        gsap.fromTo(
          panel,
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.4, ease: "power3.out" },
        );
      } else {
        gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in" });
        gsap.to(panel, {
          x: "100%",
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => {
            if (!openRef.current) gsap.set(overlay, { display: "none" });
          },
        });
      }
    });

    return () => ctx.revert();
  }, [open, mounted]);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] justify-end"
      style={{ display: "none", opacity: 0 }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`
          relative h-full w-full ${sizeStyles[size]}
          bg-zinc-950 border-l border-zinc-800
          flex flex-col shadow-2xl shadow-black/60
        `}
      >
        <div className="flex items-center px-5 py-4 border-b border-zinc-800 shrink-0">
          {title && (
            <h3 className="text-white text-sm font-medium tracking-tight truncate flex-1 mr-4">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {actions}
            {actions && onExpand && (
              <div className="w-px h-4 bg-zinc-800 mx-1" />
            )}
            {onExpand && (
              <button
                type="button"
                onClick={onExpand}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Maximize2 size={12} />
                {expandLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer p-1 ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
