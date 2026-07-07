import type { ReactNode } from "react";
import { IconBox } from "@/shared/ui/icon-box";
import { focusRingZinc } from "@/shared/ui/focus-styles";

type SidenavItemProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
  badge?: number;
  onClick?: () => void;
};

export function SidenavItem({
  label,
  icon,
  active = false,
  collapsed = false,
  badge,
  onClick,
}: SidenavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-sm transition-all duration-200 cursor-pointer group relative
        ${focusRingZinc}
        ${
          active
            ? "bg-zinc-800 text-white"
            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
        }
        ${collapsed ? "justify-center" : "justify-start"}
      `}
    >
      <IconBox
        icon={icon}
        size="sm"
        variant={active ? "active" : "default"}
        rounded="md"
      />

      {!collapsed && (
        <span className="flex-1 text-left tracking-wide truncate">{label}</span>
      )}

      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-zinc-400" />
      )}
    </button>
  );
}
