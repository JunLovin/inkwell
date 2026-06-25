"use client";

import { useEffect, useRef } from "react";
import {
  Code,
  Feather,
  HeartHandshake,
  Lock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import { Card, IconBox } from "@/shared/ui";

type Feature = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const features: Feature[] = [
  {
    icon: <Feather size={15} />,
    title: "Markdown-native",
    body: "Write the way you think — headings, lists, code, all from your keyboard.",
  },
  {
    icon: <Sparkles size={15} />,
    title: "AI assistant",
    body: "Summarize, restructure, expand — every note has a built-in collaborator.",
  },
  {
    icon: <RefreshCw size={15} />,
    title: "Cloud sync",
    body: "Edits land everywhere instantly. No merge dialogs, no plugin install.",
  },
  {
    icon: <HeartHandshake size={15} />,
    title: "Always free",
    body: "Open product. No paywall, no usage caps, no upsell.",
  },
  {
    icon: <Code size={15} />,
    title: "Open source",
    body: "Read the code, ship a PR, fork it if you want. The whole thing is yours.",
  },
  {
    icon: <Lock size={15} />,
    title: "Privacy-first",
    body: "Your notes stay yours. No tracking, no resale, no surprises.",
  },
];

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
              gridRef.current?.querySelectorAll("[data-feature]") ?? [],
              { opacity: 0, y: 24, filter: "blur(4px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.55,
                stagger: 0.05,
              },
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
      id="features"
      className="relative z-10 px-6 py-24 max-w-6xl mx-auto w-full"
    >
      <div ref={headingRef} className="max-w-2xl mb-12">
        <p className="text-zinc-600 text-xs tracking-[0.3em] uppercase">
          Why Inkwell
        </p>
        <h2 className="text-white text-3xl md:text-4xl font-light tracking-tight mt-3">
          A notes app you actually own.
        </h2>
        <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
          Every feature is built around one rule: your notes belong to you, and
          the tool gets out of your way.
        </p>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((feature) => (
          <Card
            key={feature.title}
            variant="default"
            padding="lg"
            data-feature
          >
            <div className="flex flex-col gap-4">
              <IconBox icon={feature.icon} variant="default" size="sm" />
              <div>
                <h3 className="text-white text-sm font-medium tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
