type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
};

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-2",
};

export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full border-zinc-700 border-t-zinc-300
        animate-spin shrink-0
        ${sizeStyles[size]}
      `}
    />
  );
}
