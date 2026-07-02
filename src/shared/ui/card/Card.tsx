import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "raised" | "ghost";
type CardPadding = "sm" | "md" | "lg" | "none";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  children: ReactNode;
  padding?: CardPadding;
};

const variantStyles: Record<CardVariant, string> = {
  default: "bg-zinc-900/60 border-zinc-800",
  raised: "bg-zinc-800/50 border-zinc-700/60",
  ghost: "bg-transparent border-zinc-800/60",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  variant = "default",
  padding = "md",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl border transition-colors duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
