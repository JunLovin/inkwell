"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

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

export default function LandingPage() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  const buttonWrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const h1 = h1Ref.current;
    const p = pRef.current;
    const btn = buttonRef.current;
    const btnWrap = buttonWrapRef.current;
    if (!h1 || !p || !btn || !btnWrap) return;

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

    gsap.set(chars, {
      yPercent: 100,
      opacity: 0,
      filter: "blur(8px)",
      rotateZ: 4,
    });
    gsap.set(words, { yPercent: 40, opacity: 0, filter: "blur(6px)" });
    gsap.set(btn, {
      scaleX: 0.7,
      scaleY: 0.7,
      opacity: 0,
      filter: "blur(4px)",
    });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.2 });

    tl.addLabel("title")
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
        "title",
      )
      .addLabel("sub", "title+=0.3")
      .to(
        words,
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: { amount: 0.35, ease: "power1.out" },
        },
        "sub",
      )
      .addLabel("cta", "sub+=0.45")
      .to(
        btn,
        {
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "back.out(2.5)",
        },
        "cta",
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <main className="flex h-dvh bg-[url('/landing/hero_background.png')] p-24 z-10 bg-cover font-host bg-center bg-blend-overlay">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 z-0" />
      <div className="items-center justify-start text-center mx-auto text-white flex flex-col gap-2">
        <h1 ref={h1Ref} className="text-5xl leading-tight tracking-normal">
          Where thoughts <br />
          become actions.
        </h1>
        <p ref={pRef} className="mt-4 text-gray-200 leading-tight">
          An AI companion that whispers clarity, <br />
          conjures ideas, and guides you every move.
        </p>
        <div
          ref={buttonWrapRef}
          className="w-max h-max mx-auto mt-6"
          style={{ willChange: "transform" }}
        >
          <Link
            ref={buttonRef}
            href="/register"
            className="bg-gray-200 text-neutral-800 py-2 rounded-full px-6 font-medium cursor-pointer transition-colors duration-300 hover:bg-white"
          >
            Begin Journey
          </Link>
        </div>
      </div>
    </main>
  );
}
