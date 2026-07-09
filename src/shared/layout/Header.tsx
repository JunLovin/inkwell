"use client";

import { Feather } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        header,
        { opacity: 0, marginTop: -16 },
        {
          opacity: 1,
          marginTop: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.4,
        },
      );
    });

    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ctx.revert();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      style={{ opacity: 0 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 px-5 h-12 rounded-2xl border transition-all duration-500 font-host ${
        scrolled
          ? "border-zinc-700/80 bg-zinc-900/90 backdrop-blur-md shadow-xl shadow-black/30"
          : "border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 text-white group">
        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors duration-300">
          <Feather size={13} className="text-zinc-300" />
        </div>
        <span className="text-sm font-medium tracking-wide text-zinc-200 group-hover:text-white transition-colors duration-300">
          inkwell
        </span>
      </Link>

      <div className="w-px h-4 bg-zinc-800" />

      <nav className="flex items-center gap-1">
        {[
          { label: "Home", href: "#" },
          { label: "Features", href: "#features" },
          { label: "FAQ", href: "#faq" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/70 transition-all duration-200"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="w-px h-4 bg-zinc-800" />

      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl border border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all duration-300"
      >
        Get Started
      </Link>
    </header>
  );
}
