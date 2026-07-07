import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { focusRingZincOffset } from "../focus-styles";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children?: ReactNode;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-white text-zinc-900 border border-white hover:bg-zinc-100 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:border-zinc-300",
  secondary:
    "bg-zinc-800/50 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 disabled:opacity-40",
  ghost:
    "bg-transparent text-zinc-400 border border-transparent hover:text-white hover:bg-zinc-800/70 disabled:opacity-40",
  danger:
    "bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-950/70 hover:text-red-300 hover:border-red-800/60 disabled:opacity-40",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-xl",
  md: "h-10 px-4 text-sm gap-2 rounded-2xl",
  lg: "h-12 px-6 text-sm gap-2.5 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          relative inline-flex items-center justify-center font-medium
          transition-all duration-200 cursor-pointer
          disabled:cursor-not-allowed select-none shrink-0
          ${focusRingZincOffset}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <Loader2
            size={size === "sm" ? 12 : 14}
            className="animate-spin shrink-0"
          />
        )}
        {!loading && icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
