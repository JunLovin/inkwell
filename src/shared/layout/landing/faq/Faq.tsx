"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

type Item = {
  question: string;
  answer: string;
};

const items: Item[] = [
  {
    question: "Is Inkwell really free?",
    answer:
      "Yes, forever. No premium tier, no usage caps. Hosting is paid by donations and the maintainer — the product never gates features behind a wall.",
  },
  {
    question: "Where are my notes stored?",
    answer:
      "In Convex, encrypted in transit. Each note is scoped to your account; nobody else can read them. You can export everything at any time from Settings → Danger Zone.",
  },
  {
    question: "Is it open source?",
    answer:
      "Yes. The full source lives on GitHub — read it, fork it, ship PRs. Self-hosting is on the roadmap.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Anytime. Settings → Danger Zone → \"Download my notes (JSON)\" gives you a portable file with everything, including archived and favorited notes.",
  },
];

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: Item;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const inner = innerRef.current;
    if (!body || !inner) return;

    if (open) {
      gsap.fromTo(
        body,
        { maxHeight: 0, opacity: 0 },
        {
          maxHeight: inner.scrollHeight,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(body, {
        maxHeight: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
      });
    }
  }, [open]);

  return (
    <div className="border-b border-zinc-800/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
      >
        <span
          className={`text-sm font-medium transition-colors ${
            open ? "text-white" : "text-zinc-300 group-hover:text-white"
          }`}
        >
          {item.question}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-600 transition-transform duration-300 ${
            open ? "rotate-180 text-zinc-300" : ""
          }`}
        />
      </button>
      <div
        ref={bodyRef}
        style={{ maxHeight: 0, opacity: 0, overflow: "hidden" }}
      >
        <div ref={innerRef} className="pb-5 pr-8">
          <p className="text-zinc-500 text-sm leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = () => {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .fromTo(
              headingRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6 },
            )
            .fromTo(
              listRef.current?.children ?? [],
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
              "-=0.3",
            );
        };

        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                trigger();
                observer.disconnect();
                break;
              }
            }
          },
          { threshold: 0.15 },
        );
        observer.observe(section);

        return () => observer.disconnect();
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative z-10 px-6 py-24 max-w-3xl mx-auto w-full"
    >
      <div ref={headingRef} className="mb-10">
        <p className="text-zinc-600 text-xs tracking-[0.3em] uppercase">
          Frequently asked
        </p>
        <h2 className="text-white text-3xl md:text-4xl font-light tracking-tight mt-3">
          Questions, answered.
        </h2>
      </div>

      <div ref={listRef}>
        {items.map((item, idx) => (
          <FaqRow
            key={item.question}
            item={item}
            open={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </section>
  );
}
