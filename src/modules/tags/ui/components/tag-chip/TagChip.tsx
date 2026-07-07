"use client";

import { forwardRef } from "react";
import { X } from "lucide-react";

import { focusRingZinc } from "@/shared/ui";
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

    const baseClasses = `inline-flex items-center rounded-md border ${sizeStyles[size]} ${colorClass} ${ringClass} transition-all ${className}`;

    const label = (
      <span className="font-medium tracking-tight leading-none truncate max-w-[120px]">
        {name}
      </span>
    );

    if (onRemove) {
      return (
        <span className={`${baseClasses} cursor-default`}>
          {label}
          <button
            type="button"
            aria-label={`Remove ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={`opacity-60 hover:opacity-100 transition-opacity cursor-pointer rounded-sm ${focusRingZinc}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      );
    }

    if (interactive) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          className={`${baseClasses} cursor-pointer ${focusRingZinc}`}
        >
          {label}
        </button>
      );
    }

    return <span className={`${baseClasses} cursor-default`}>{label}</span>;
  },
);

TagChip.displayName = "TagChip";
