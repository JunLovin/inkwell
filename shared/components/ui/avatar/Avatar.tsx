type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  src?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
};

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

const indicatorSizes: Record<AvatarSize, string> = {
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", online }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`
          rounded-full overflow-hidden border border-zinc-700
          bg-zinc-800 flex items-center justify-center
          text-zinc-300 font-medium select-none
          ${sizeStyles[size]}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={name ?? "avatar"}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          getInitials(name)
        ) : (
          <span className="text-zinc-600">?</span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-zinc-900
            ${online ? "bg-emerald-400" : "bg-zinc-600"}
            ${indicatorSizes[size]}
          `}
        />
      )}
    </div>
  );
}
