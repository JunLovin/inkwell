import type { ReactNode } from "react";

type IconBoxVariant =
  | "default"
  | "active"
  | "success"
  | "warning"
  | "danger"
  | "info";
type IconBoxSize = "sm" | "md" | "lg";

type IconBoxProps = {
  icon: ReactNode;
  variant?: IconBoxVariant;
  size?: IconBoxSize;
  rounded?: "md" | "lg" | "full";
};

const variantStyles: Record<IconBoxVariant, string> = {
  default: "bg-zinc-800 border-zinc-700 text-zinc-400",
  active: "bg-zinc-700 border-zinc-600 text-white",
  success: "bg-emerald-950/50 border-emerald-900/60 text-emerald-400",
  warning: "bg-amber-950/50 border-amber-900/60 text-amber-400",
  danger: "bg-red-950/50 border-red-900/60 text-red-400",
  info: "bg-blue-950/50 border-blue-900/60 text-blue-400",
};

const sizeStyles: Record<IconBoxSize, { box: string; icon: string }> = {
  sm: { box: "w-7 h-7", icon: "text-xs" },
  md: { box: "w-9 h-9", icon: "text-sm" },
  lg: { box: "w-11 h-11", icon: "text-base" },
};

const roundedStyles = {
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function IconBox({
  icon,
  variant = "default",
  size = "md",
  rounded = "lg",
}: IconBoxProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center shrink-0 border
        transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size].box}
        ${roundedStyles[rounded]}
      `}
    >
      <span className={sizeStyles[size].icon}>{icon}</span>
    </div>
  );
}
