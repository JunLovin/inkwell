"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Feather } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

import { SidenavItem } from "./sidenav-item/SidenavItem";
import { SidenavSection } from "./sidenav-section/SidenavSection";
import { SidenavUser } from "./sidenav-user/SidenavUser";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
};

type User = {
  name: string;
  email: string;
  avatar?: string;
};

type SidenavProps = {
  items: NavItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  user: User;
  onSettings?: () => void;
  onLogout?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sectionActions?: Record<string, React.ReactNode>;
  staticSections?: string[];
};

const COLLAPSED_W = 72;
const EXPANDED_W = 240;

export function Sidenav({
  items,
  activeId,
  onNavigate,
  user,
  onSettings,
  onLogout,
  open,
  onOpenChange,
  sectionActions,
  staticSections,
}: SidenavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(open ?? false);

  const sidenavRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = sidenavRef.current;
    const overlay = overlayRef.current;
    if (!nav || !overlay) return;

    if (mobileOpen) {
      gsap.set(overlay, { display: "block" });
      gsap.set(nav, { x: -EXPANDED_W });
      gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(nav, { x: 0, duration: 0.35, ease: "power3.out" });
    } else {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
        },
      });
      gsap.to(nav, { x: -EXPANDED_W, duration: 0.3, ease: "power3.in" });
    }
  }, [mobileOpen]);

  useEffect(() => {
    const nav = sidenavRef.current;
    if (!nav) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    gsap.to(nav, {
      width: collapsed ? COLLAPSED_W : EXPANDED_W,
      duration: 0.35,
      ease: "power3.inOut",
    });
  }, [collapsed]);

  useEffect(() => {
    const nav = sidenavRef.current;
    const isMobile = window.innerWidth < 768;
    if (!nav || isMobile) return;

    gsap.fromTo(
      nav,
      { x: -EXPANDED_W, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.1 },
    );
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    onOpenChange?.(false);
  };

  const sections = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.section ?? "__default";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  for (const key of staticSections ?? []) {
    if (!sections[key]) sections[key] = [];
  }

  const sectionKeys = Object.keys(sections);

  return (
    <>
      <div
        ref={overlayRef}
        onClick={closeMobile}
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
        style={{ display: "none", opacity: 0 }}
      />

      <aside
        ref={sidenavRef}
        style={{ width: EXPANDED_W }}
        className={`
          fixed md:relative top-0 left-0 h-full z-50
          flex flex-col bg-zinc-950 border-r border-zinc-800/80
          shrink-0 overflow-hidden
          -translate-x-full md:translate-x-0
        `}
      >
        <div
          className={`flex items-center h-16 px-4 border-b border-zinc-800/80 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors duration-300">
                <Feather size={13} className="text-zinc-300" />
              </div>
              <span className="text-sm font-medium tracking-wide text-zinc-200">
                inkwell
              </span>
            </Link>
          )}

          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Feather size={13} className="text-zinc-300" />
            </div>
          )}

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="md:hidden text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden md:flex text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        <div
          ref={itemsRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5"
        >
          {sectionKeys.map((key) => (
            <SidenavSection
              key={key}
              label={key === "__default" ? undefined : key}
              collapsed={collapsed}
              trailing={key === "__default" ? undefined : sectionActions?.[key]}
            >
              {sections[key].map((item) => (
                <SidenavItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={activeId === item.id}
                  collapsed={collapsed}
                  badge={item.badge}
                  onClick={() => {
                    onNavigate?.(item.id);
                    closeMobile();
                  }}
                />
              ))}
            </SidenavSection>
          ))}
        </div>

        {collapsed && (
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-full flex items-center justify-center py-2 text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="px-3 pb-4 shrink-0 border-t border-zinc-800/80 pt-3">
          <SidenavUser
            name={user.name}
            email={user.email}
            avatar={user.avatar}
            collapsed={collapsed}
            onSettings={onSettings}
            onLogout={onLogout}
          />
        </div>
      </aside>
    </>
  );
}

export { SidenavItem, SidenavSection, SidenavUser };
export type { NavItem as SidenavNavItem };
