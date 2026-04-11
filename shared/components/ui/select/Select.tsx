"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import gsap from "gsap";

export type SelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export function Select({
  options,
  value,
  placeholder = "Select an option",
  label,
  error,
  hint,
  disabled = false,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasError = !!error;

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (open) {
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
      });
    }
  }, [open]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-zinc-500 text-xs tracking-wide uppercase">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border
            text-sm text-left transition-all duration-300 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
            ${
              hasError
                ? "border-red-900/60 bg-red-950/20"
                : open
                  ? "border-zinc-600 bg-zinc-800/80"
                  : "border-zinc-800 bg-zinc-800/40 hover:border-zinc-700"
            }
          `}
        >
          {selected?.icon && (
            <span className="shrink-0 text-zinc-400">{selected.icon}</span>
          )}
          <span
            className={`flex-1 truncate ${selected ? "text-white" : "text-zinc-700"}`}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-zinc-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent transition-opacity duration-500 ${open && !hasError ? "opacity-100" : "opacity-0"}`}
        />

        {open && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-xl shadow-black/40 z-50 max-h-56 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-150 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    option.value === value
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                  }
                `}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="flex-1 text-left">{option.label}</span>
                {option.value === value && (
                  <Check size={13} className="shrink-0 text-zinc-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {(error || hint) && (
        <p
          className={`text-xs pl-1 tracking-wide ${hasError ? "text-red-500/80" : "text-zinc-600"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
