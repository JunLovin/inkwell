"use client";

import { forwardRef } from "react";
import { X } from "lucide-react";

import { tagColorClasses } from "../../../domain/services/tag-color";

type Size = "sm" | "md";

type TagChipProps = {
  name: string;
  color: string;
  size?: Size;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
};

const sizeStyles: Record<Size, string> = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

export const TagChip = forwardRef<HTMLButtonElement, TagChipProps>(
  (
    {
      name,
      color,
      size = "sm",
      selected = false,
      onClick,
      onRemove,
      className = "",
    },
    ref,
  ) => {
    const colorClass = tagColorClasses(color);
    const interactive = Boolean(onClick);
    const ringClass = selected
      ? "ring-1 ring-zinc-300/40"
      : interactive
        ? "hover:ring-1 hover:ring-zinc-700"
        : "";

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={!interactive && !onRemove}
        className={`inline-flex items-center rounded-md border ${sizeStyles[size]} ${colorClass} ${ringClass} transition-all ${interactive ? "cursor-pointer" : "cursor-default"} disabled:cursor-default ${className}`}
      >
        <span className="font-medium tracking-tight leading-none truncate max-w-[120px]">
          {name}
        </span>
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Remove ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }
            }}
            className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>
    );
  },
);

TagChip.displayName = "TagChip";
