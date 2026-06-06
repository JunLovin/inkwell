import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leading, trailing, className = "", id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-zinc-500 text-xs tracking-wide uppercase"
          >
            {label}
          </label>
        )}

        <div
          className={`
            relative flex items-center rounded-2xl border transition-all duration-300
            ${
              hasError
                ? "border-red-900/60 bg-red-950/20 focus-within:border-red-800/60"
                : "border-zinc-800 bg-zinc-800/40 focus-within:border-zinc-600 focus-within:bg-zinc-800/80"
            }
          `}
        >
          {leading && (
            <span className="pl-4 text-zinc-500 shrink-0">{leading}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-transparent text-white text-sm py-3.5 outline-none
              placeholder:text-zinc-700
              ${leading ? "pl-2.5" : "pl-4"}
              ${trailing ? "pr-2.5" : "pr-4"}
              ${className}
            `}
            {...props}
          />

          {trailing && (
            <span className="pr-4 text-zinc-500 shrink-0">{trailing}</span>
          )}

          <div
            className={`
              absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r
              from-transparent to-transparent transition-opacity duration-500
              ${
                hasError
                  ? "via-red-800 opacity-100"
                  : "via-zinc-500 opacity-0 focus-within:opacity-100"
              }
            `}
          />
        </div>

        {(error || hint) && (
          <p
            className={`text-xs pl-1 tracking-wide ${
              hasError ? "text-red-500/80" : "text-zinc-600"
            }`}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
