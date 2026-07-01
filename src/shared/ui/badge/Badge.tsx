import type { ReactNode } from "react";

type BadgeVariant =
  "default" | "active" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-800/80 text-zinc-400 border-zinc-700/60",
  active: "bg-zinc-700/80 text-white border-zinc-600",
  success: "bg-emerald-950/50 text-emerald-400 border-emerald-900/60",
  warning: "bg-amber-950/50 text-amber-400 border-amber-900/60",
  danger: "bg-red-950/50 text-red-400 border-red-900/60",
  info: "bg-blue-950/50 text-blue-400 border-blue-900/60",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-500",
  active: "bg-white",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
        text-xs border tracking-wide
        ${variantStyles[variant]}
      `}
    >
      {dot && (
        <span
          data-testid="badge-dot"
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
