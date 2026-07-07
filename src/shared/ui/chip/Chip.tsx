import { X } from "lucide-react";
import type { ReactNode } from "react";

import { focusRingZinc } from "../focus-styles";

export type ChipVariant =
  "default" | "active" | "success" | "warning" | "danger" | "info";

type ChipProps = {
  children: ReactNode;
  variant?: ChipVariant;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  icon?: ReactNode;
};

const variantStyles: Record<ChipVariant, string> = {
  default:
    "bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:border-zinc-600 hover:text-zinc-300",
  active: "bg-zinc-700/60 text-white border-zinc-600 hover:border-zinc-500",
  success:
    "bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:border-emerald-800/60",
  warning:
    "bg-amber-950/40 text-amber-400 border-amber-900/60 hover:border-amber-800/60",
  danger:
    "bg-red-950/40 text-red-400 border-red-900/60 hover:border-red-800/60",
  info: "bg-blue-950/40 text-blue-400 border-blue-900/60 hover:border-blue-800/60",
};

export function Chip({
  children,
  variant = "default",
  removable = false,
  onRemove,
  onClick,
  icon,
}: ChipProps) {
  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
        border transition-all duration-200 select-none
        ${variantStyles[variant]}
        ${isClickable ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label="Remove"
          className={`shrink-0 ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity duration-150 cursor-pointer rounded-sm ${focusRingZinc}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
