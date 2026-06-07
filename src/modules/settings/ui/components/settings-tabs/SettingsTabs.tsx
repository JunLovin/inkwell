"use client";

import type { ReactNode } from "react";

export type SettingsTabId = "profile" | "account" | "danger";

type Tab = {
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
};

type SettingsTabsProps = {
  tabs: Tab[];
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
};

export function SettingsTabs({ tabs, active, onChange }: SettingsTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-800/80">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm transition-colors cursor-pointer ${
              isActive
                ? "text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="shrink-0">{tab.icon}</span>
            <span className="tracking-wide">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-px bg-zinc-100" />
            )}
          </button>
        );
      })}
    </div>
  );
}
