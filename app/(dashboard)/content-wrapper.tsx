"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ContentWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isNoteDetail = /^\/dashboard\/notes\/[^/]+$/.test(pathname);
  return (
    <div
      className={`flex-1 h-full min-h-0 ${isNoteDetail ? "overflow-hidden" : "p-4 overflow-y-auto"}`}
    >
      {children}
    </div>
  );
}
