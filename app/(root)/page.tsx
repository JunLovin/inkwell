"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge, Chip, IconBox } from "@/shared/ui";

function splitCharsPreservingBreaks(el: HTMLElement) {
  const html = el.innerHTML;
  const parts = html.split(/(<br\s*\/?>)/gi);
  el.innerHTML = parts
    .map((part) => {
      if (/^<br/i.test(part)) return part;
      return part
        .split("")
        .map((char) =>
          char === " "
            ? `<span style="display:inline-block">&nbsp;</span>`
            : `<span class="char" style="display:inline-block;will-change:transform,opacity,filter;">${char}</span>`,
        )
        .join("");
    })
    .join("");
  return el.querySelectorAll(".char");
}

const HINTS = [
  "Smart summaries",
  "Note linking",
  "AI insights",
  "Always in sync",
] as const;

export default function LandingPage() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const secondaryRef = useRef<HTMLAnchorElement>(null);
  const hintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h1 = h1Ref.current;
    const p = pRef.current;
    const btn = buttonRef.current;
    const secondary = secondaryRef.current;
    const badge = badgeRef.current;
    const hints = hintsRef.current;

    if (!h1 || !p || !btn || !badge || !hints) return;

    const originalH1 = h1.innerHTML;
    const originalP = p.innerHTML;

    const chars = splitCharsPreservingBreaks(h1);

    const pText = p.innerText;
    p.innerHTML = pText
      .split(" ")
      .map(
        (word) =>
          `<span class="word" style="display:inline-block;will-change:transform,opacity,filter;">${word}&nbsp;</span>`,
      )
      .join("");
    const words = p.querySelectorAll(".word");

    gsap.set(badge, { opacity: 0, y: -10, filter: "blur(4px)" });
    gsap.set(chars, {
      yPercent: 100,
      opacity: 0,
      filter: "blur(8px)",
      rotateZ: 4,
    });
    gsap.set(words, { yPercent: 40, opacity: 0, filter: "blur(6px)" });
    gsap.set([btn, secondary], {
      scaleX: 0.85,
      scaleY: 0.85,
      opacity: 0,
      filter: "blur(4px)",
    });
    gsap.set(hints, { opacity: 0, y: 10 });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.6 });

    tl.to(badge, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.6,
      ease: "power3.out",
    })
      .to(
        chars,
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: { amount: 0.6, ease: "power2.inOut" },
        },
        "-=0.3",
      )
      .to(
        words,
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: { amount: 0.35, ease: "power1.out" },
        },
        "-=0.7",
      )
      .to(
        [btn, secondary],
        {
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "back.out(2.5)",
          stagger: 0.08,
        },
        "-=0.4",
      )
      .to(
        hints,
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2",
      );

    return () => {
      tl.kill();
      h1.innerHTML = originalH1;
      p.innerHTML = originalP;
    };
  }, []);

  return (
    <main className="relative flex h-dvh font-host overflow-hidden bg-zinc-950">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
        style={{ backgroundImage: "url('/landing/hero_background.png')" }}
      />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px), repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-transparent to-zinc-950/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-zinc-950/60" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center mx-auto px-6 max-w-3xl gap-0">
        <div ref={badgeRef} className="mb-8">
          <Badge variant="default" dot={false}>
            <span className="flex items-center gap-1.5">
              <IconBox
                icon={<Sparkles size={10} />}
                size="sm"
                variant="default"
                rounded="full"
              />
              AI-powered note taking
            </span>
          </Badge>
        </div>

        <h1
          ref={h1Ref}
          className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05] overflow-hidden"
        >
          Where thoughts <br />
          become actions.
        </h1>

        <p
          ref={pRef}
          className="mt-6 text-zinc-400 text-base md:text-lg leading-relaxed max-w-md"
        >
          An AI companion that whispers clarity, conjures ideas, and guides your
          every move.
        </p>

        <div className="flex items-center gap-3 mt-10">
          <Link
            ref={buttonRef}
            href="/register"
            className="flex items-center gap-2 bg-white text-zinc-900 py-2.5 px-6 rounded-2xl text-sm font-medium transition-all duration-300 hover:bg-zinc-100 group"
          >
            Begin Journey
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>

          <Link
            ref={secondaryRef}
            href="#features"
            className="flex items-center gap-2 text-zinc-400 hover:text-white py-2.5 px-6 rounded-2xl text-sm border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/50 transition-all duration-300 backdrop-blur-sm"
          >
            See features
          </Link>
        </div>

        <div
          ref={hintsRef}
          className="flex items-center gap-2 mt-12 flex-wrap justify-center"
        >
          {HINTS.map((feat) => (
            <Chip key={feat} variant="default">
              {feat}
            </Chip>
          ))}
        </div>
      </div>
    </main>
  );
}
