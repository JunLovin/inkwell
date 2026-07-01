"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";

type Side = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  content: string;
  children: ReactNode;
  side?: Side;
};

type Coords = { x: number; y: number };

function getCoords(rect: DOMRect, side: Side): Coords {
  switch (side) {
    case "top":
      return { x: rect.left + rect.width / 2, y: rect.top - 6 };
    case "bottom":
      return { x: rect.left + rect.width / 2, y: rect.bottom + 6 };
    case "left":
      return { x: rect.left - 6, y: rect.top + rect.height / 2 };
    case "right":
      return { x: rect.right + 6, y: rect.top + rect.height / 2 };
  }
}

const transformMap: Record<Side, string> = {
  top: "translateX(-50%) translateY(-100%)",
  bottom: "translateX(-50%)",
  left: "translateX(-100%) translateY(-50%)",
  right: "translateY(-50%)",
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<Coords>({ x: 0, y: 0 });
  const mounted = usePortalMounted();
  const wrapperRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    setCoords(getCoords(el.getBoundingClientRect(), side));
    setVisible(true);
  }, [side]);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <>
      <span
        ref={wrapperRef}
        data-testid="tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </span>

      {mounted &&
        visible &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              left: coords.x,
              top: coords.y,
              transform: transformMap[side],
              zIndex: 9999,
            }}
            className="pointer-events-none px-2 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[10px] rounded-lg whitespace-nowrap shadow-lg shadow-black/40"
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
