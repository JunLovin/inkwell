import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  resize?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, resize = false, className = "", id, ...props },
    ref,
  ) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-zinc-500 text-xs tracking-wide uppercase"
          >
            {label}
          </label>
        )}

        <div
          className={`
            relative rounded-2xl border transition-all duration-300
            ${
              hasError
                ? "border-red-900/60 bg-red-950/20 focus-within:border-red-800/60"
                : "border-zinc-800 bg-zinc-800/40 focus-within:border-zinc-600 focus-within:bg-zinc-800/80"
            }
          `}
        >
          <textarea
            ref={ref}
            id={textareaId}
            className={`
              w-full bg-transparent text-white text-sm px-4 py-3.5 outline-none
              placeholder:text-zinc-700 min-h-[100px]
              ${resize ? "resize-y" : "resize-none"}
              ${className}
            `}
            {...props}
          />

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

Textarea.displayName = "Textarea";
