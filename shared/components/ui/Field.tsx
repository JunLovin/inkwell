type FieldProps = {
  label: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function Field({ label, error, action, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-zinc-500 text-xs tracking-wide uppercase">
          {label}
        </label>
        {action}
      </div>
      <div
        className={`relative rounded-2xl border transition-all duration-300 ${
          error
            ? "border-red-900/60 bg-red-950/20"
            : "border-zinc-800 bg-zinc-800/40 focus-within:border-zinc-600 focus-within:bg-zinc-800/80"
        }`}
      >
        {children}
        <div
          className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500 ${
            error
              ? "via-red-800 opacity-100"
              : "via-zinc-500 opacity-0 focus-within:opacity-100"
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500/80 text-xs pl-1 tracking-wide">{error}</p>
      )}
    </div>
  );
}
