"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AIChatTyping() {
  const dotsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const dots = dotsRef.current.filter(Boolean) as HTMLSpanElement[];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dots,
        { y: 0, opacity: 0.4 },
        {
          y: -4,
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
          stagger: 0.15,
          repeat: -1,
          yoyo: true,
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1 bg-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block"
          />
        ))}
      </div>
    </div>
  );
}
