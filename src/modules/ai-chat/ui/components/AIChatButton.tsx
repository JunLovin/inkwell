"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { useAIChatStore } from "../../infrastructure/stores/ai-chat.store";
import { AIChatPanel } from "./AIChatPanel";

export function AIChatButton() {
  const iconRef = useRef<SVGSVGElement>(null);
  const { toggle, isOpen } = useAIChatStore();

  useEffect(() => {
    if (isOpen) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        iconRef.current,
        { scale: 1 },
        {
          scale: 1.08,
          duration: 2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    });
    return () => ctx.revert();
  }, [isOpen]);

  return (
    <>
      <button
        onClick={toggle}
        className={`fixed bottom-6 right-6 z-[150] w-12 h-12 flex items-center justify-center rounded-2xl border transition-colors shadow-lg shadow-black/40 ${
          isOpen
            ? "bg-zinc-800 border-zinc-700 text-emerald-400"
            : "bg-zinc-900 border-zinc-800 text-emerald-400 hover:bg-zinc-800 hover:border-zinc-700"
        }`}
      >
        <Sparkles ref={iconRef} className="w-5 h-5" />
      </button>
      <AIChatPanel />
    </>
  );
}
