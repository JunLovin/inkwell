"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, LogOut, User, ChevronUp } from "lucide-react";
import gsap from "gsap";
import { Avatar } from "@/shared/components/ui";

type UserMenuItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
};

type SidenavUserProps = {
  name: string;
  email: string;
  avatar?: string;
  collapsed?: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
  extraItems?: UserMenuItem[];
};

const defaultMenuItems = (
  onSettings?: () => void,
  onLogout?: () => void,
): UserMenuItem[] => [
  {
    label: "Profile",
    icon: <User size={14} />,
    onClick: onSettings ?? (() => {}),
  },
  {
    label: "Settings",
    icon: <Settings size={14} />,
    onClick: onSettings ?? (() => {}),
  },
  {
    label: "Log out",
    icon: <LogOut size={14} />,
    onClick: onLogout ?? (() => {}),
    variant: "danger",
  },
];

export function SidenavUser({
  name,
  email,
  avatar,
  collapsed = false,
  onSettings,
  onLogout,
  extraItems = [],
}: SidenavUserProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const items = [...extraItems, ...defaultMenuItems(onSettings, onLogout)];

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (open) {
      gsap.fromTo(
        menu,
        { opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.25,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 8,
        scale: 0.97,
        filter: "blur(4px)",
        duration: 0.15,
        ease: "power2.in",
      });
    }
  }, [open]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative">
      {open && (
        <div
          ref={menuRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-xl shadow-black/40 z-50"
        >
          <div className="px-3 py-2 border-b border-zinc-800 mb-1">
            <p className="text-xs font-medium text-zinc-300 truncate">{name}</p>
            <p className="text-[11px] text-zinc-600 truncate">{email}</p>
          </div>

          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs
                transition-all duration-150 cursor-pointer
                ${
                  item.variant === "danger"
                    ? "text-red-400 hover:bg-red-950/40 hover:text-red-300"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center gap-3 p-2.5 rounded-xl
          border border-zinc-800 hover:border-zinc-700
          bg-zinc-900/60 hover:bg-zinc-800/60
          transition-all duration-200 cursor-pointer group
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <Avatar src={avatar} name={name} size="sm" />

        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {name}
              </p>
              <p className="text-[11px] text-zinc-600 truncate">{email}</p>
            </div>
            <ChevronUp
              size={14}
              className={`text-zinc-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>
    </div>
  );
}
