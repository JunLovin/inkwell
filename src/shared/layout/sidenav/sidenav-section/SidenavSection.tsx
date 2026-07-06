import type { ReactNode } from "react";

type SidenavSectionProps = {
  label?: string;
  collapsed?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
};

export function SidenavSection({
  label,
  collapsed,
  trailing,
  children,
}: SidenavSectionProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {label && !collapsed && (
        <div className="flex items-center justify-between pr-1 py-1">
          <p className="text-[10px] text-zinc-700 uppercase tracking-[0.2em] px-3 font-medium">
            {label}
          </p>
          {trailing}
        </div>
      )}
      {label && collapsed && <div className="mx-3 my-1.5 h-px bg-zinc-800" />}
      {children}
    </div>
  );
}
