"use client";

import Link from "next/link";
import { Code, Feather } from "lucide-react";

type Column = {
  heading: string;
  links: { label: string; href: string; external?: boolean }[];
};

const columns: Column[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "FAQ", href: "#faq" },
      { label: "Sign up", href: "/register" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-zinc-800/60 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 group w-fit"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors duration-300">
                <Feather size={13} className="text-zinc-300" />
              </div>
              <span className="text-sm font-medium tracking-wide text-zinc-200">
                inkwell
              </span>
            </Link>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-xs">
              Open notes, for everyone. Built with care, free forever.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="space-y-3">
              <p className="text-zinc-700 text-[10px] tracking-[0.2em] uppercase">
                {column.heading}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-zinc-500 text-sm hover:text-zinc-200 transition-colors duration-200"
                      >
                        {link.label === "GitHub" && (
                          <Code size={12} className="shrink-0" />
                        )}
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-zinc-500 text-sm hover:text-zinc-200 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-zinc-700 text-xs">
            © {new Date().getFullYear()} Inkwell. Open and paywall-free.
          </p>
          <p className="text-zinc-700 text-xs">Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
