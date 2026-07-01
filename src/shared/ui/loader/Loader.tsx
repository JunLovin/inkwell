type LoaderVariant = "bar" | "circle";
type LoaderSize = "sm" | "md" | "lg";

type LoaderProps = {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
};

const circleSize: Record<LoaderSize, string> = {
  sm: "w-5 h-5 border-[1.5px]",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-2",
};

const barSize: Record<LoaderSize, string> = {
  sm: "h-0.5",
  md: "h-1",
  lg: "h-1.5",
};

export function Loader({ variant = "bar", size = "md", label }: LoaderProps) {
  const ariaLabel = label ?? "Loading";
  if (variant === "circle") {
    return (
      <div
        role="status"
        aria-label={ariaLabel}
        className="flex flex-col items-center justify-center gap-3"
      >
        <span
          className={`
            rounded-full border-zinc-800 border-t-zinc-400
            animate-spin shrink-0 ${circleSize[size]}
          `}
        />
        {label && (
          <p className="text-zinc-600 text-xs tracking-wide">{label}</p>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className="flex flex-col gap-2 w-full"
    >
      <div
        className={`w-full bg-zinc-800 rounded-full overflow-hidden ${barSize[size]}`}
      >
        <div
          className={`h-full bg-zinc-400 rounded-full animate-[loading-bar_1.4s_ease-in-out_infinite]`}
          style={{
            animation: "loading-bar 1.4s ease-in-out infinite",
          }}
        />
      </div>
      {label && (
        <p className="text-zinc-600 text-xs tracking-wide text-center">
          {label}
        </p>
      )}

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%) scaleX(0.3); }
          50% { transform: translateX(50%) scaleX(0.6); }
          100% { transform: translateX(200%) scaleX(0.3); }
        }
      `}</style>
    </div>
  );
}
