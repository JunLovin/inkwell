"use client";

import dynamic from "next/dynamic";

const AIChatPanel = dynamic(
  () => import("@/modules/ai-chat").then((m) => m.AIChatPanel),
  { ssr: false },
);

export function AIChatPanelLoader() {
  return <AIChatPanel />;
}
