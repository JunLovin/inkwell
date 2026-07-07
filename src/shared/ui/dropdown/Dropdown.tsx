"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import gsap from "gsap";
import type { ReactNode } from "react";

import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";
import { focusRingZinc } from "../focus-styles";

export type DropdownItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  checked?: boolean;
  separator?: boolean;
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect?: (id: string) => void;
  align?: "left" | "right";
  width?: number;
  closeOnSelect?: boolean;
};

type Coords = { top: number; left: number; width: number };

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = "left",
  width = 200,
  closeOnSelect = true,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0, width });
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = usePortalMounted();

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (open) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: align === "right" ? rect.right - width : rect.left,
        width,
      });
      gsap.set(menu, { display: "block" });
      gsap.fromTo(
        menu,
        { opacity: 0, y: -6, scale: 0.97, filter: "blur(3px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.22,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: -6,
        scale: 0.97,
        filter: "blur(3px)",
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(menu, { display: "none" });
        },
      });
    }
  }, [open, align, width]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {mounted &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              display: "none",
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-xl shadow-black/40"
          >
            {items.map((item) =>
              item.separator ? (
                <div key={item.id} className="my-1 h-px bg-zinc-800" />
              ) : (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    onSelect?.(item.id);
                    if (closeOnSelect) setOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
                    transition-all duration-150 cursor-pointer text-left
                    ${focusRingZinc}
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      item.variant === "danger"
                        ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }
                  `}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.checked && (
                    <Check size={12} className="text-zinc-400 shrink-0" />
                  )}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

type DropdownTriggerProps = {
  children: ReactNode;
  chevron?: boolean;
};

export function DropdownTrigger({
  children,
  chevron = true,
}: DropdownTriggerProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-sm transition-all duration-200">
      {children}
      {chevron && <ChevronDown size={14} className="text-zinc-600 shrink-0" />}
    </div>
  );
}
