"use client";

import { useEffect } from "react";

type Shortcut = {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
};

function matches(e: KeyboardEvent, s: Shortcut): boolean {
  if (e.key.toLowerCase() !== s.key.toLowerCase()) return false;
  const metaOrCtrl = e.metaKey || e.ctrlKey;
  if (s.meta && !metaOrCtrl) return false;
  if (!s.meta && metaOrCtrl) return false;
  if (s.shift && !e.shiftKey) return false;
  if (!s.shift && e.shiftKey) return false;
  if (s.alt && !e.altKey) return false;
  if (!s.alt && e.altKey) return false;
  return true;
}

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcut(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        if (!matches(e, s)) continue;
        if (!s.meta && isTypingInField(e.target)) continue;
        s.handler(e);
        return;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts, enabled]);
}
