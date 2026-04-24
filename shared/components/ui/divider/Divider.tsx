type DividerProps = {
  label?: string;
  orientation?: "horizontal" | "vertical";
};

export function Divider({ label, orientation = "horizontal" }: DividerProps) {
  if (orientation === "vertical") {
    return <div className="w-px self-stretch bg-zinc-800" />;
  }

  if (label) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-700 text-xs tracking-widest uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
    );
  }

  return <div className="h-px w-full bg-zinc-800" />;
}
