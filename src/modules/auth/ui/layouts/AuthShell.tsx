"use client";

import { ArrowLeft, Feather } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Chip } from "@/shared/ui";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLAnchorElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        leftPanelRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power4.inOut" },
      )
        .fromTo(
          backRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.6 },
          "-=0.3",
        )
        .fromTo(
          linesRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4",
        )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.5",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={containerRef}
      className="flex h-dvh font-host overflow-hidden bg-zinc-950"
    >
      <div
        ref={leftPanelRef}
        className="hidden md:flex flex-2 relative flex-col items-start p-10 justify-between overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 30% 70%, rgba(39,39,42,0.9) 0%, rgba(9,9,11,1) 70%)",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/landing/hero_background.png')" }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        <Link
          ref={backRef}
          href="/"
          className="relative z-20 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 text-sm tracking-wide group"
        >
          <span className="w-6 h-px bg-zinc-400 group-hover:w-8 group-hover:bg-white transition-all duration-300" />
          <ArrowLeft size={16} />
          Back
        </Link>

        <div ref={headlineRef} className="relative z-20 space-y-6">
          <div ref={linesRef} className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-zinc-500" />
            <span className="text-zinc-500 text-xs tracking-[0.3em] uppercase">
              Inkwell
            </span>
          </div>

          <h1 className="text-white text-4xl xl:text-5xl font-light tracking-tight leading-[1.1]">
            Your thoughts,
            <br />
            <span className="text-zinc-400">amplified by AI.</span>
          </h1>

          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Connect ideas, surface insights, and write with clarity — all in one
            intelligent workspace.
          </p>

          <div className="flex gap-6 pt-4">
            {["Smart summaries", "Note linking", "AI insights"].map(
              (feature) => (
                <Chip key={feature}>
                  <span className="text-zinc-600 text-xs tracking-wide">
                    {feature}
                  </span>
                </Chip>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-900">
        <div className="absolute top-6 left-6 md:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <Feather size={16} />
            <span className="font-light tracking-widest">inkwell</span>
          </Link>
        </div>

        <div className="w-full max-w-sm px-6 relative z-10">{children}</div>
      </div>
    </main>
  );
}
