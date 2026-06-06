import type { ReactNode } from "react";

type SidenavSectionProps = {
  label?: string;
  collapsed?: boolean;
  children: ReactNode;
};

export function SidenavSection({
  label,
  collapsed,
  children,
}: SidenavSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && !collapsed && (
        <p className="text-[10px] text-zinc-700 uppercase tracking-[0.2em] px-3 py-1.5 font-medium">
          {label}
        </p>
      )}
      {label && collapsed && <div className="mx-3 my-1.5 h-px bg-zinc-800" />}
      {children}
    </div>
  );
}
