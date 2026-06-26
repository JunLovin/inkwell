"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import {
  FileText,
  Star,
  Archive,
  Plus,
  ArrowRight,
  Clock,
  Feather,
} from "lucide-react";

import { Card, IconBox, Button, Loader } from "@/shared/ui";
import { useCurrentUser } from "@/modules/auth";
import { NoteCard } from "../components/note-card";
import {
  useAllNotes,
  useNoteCounts,
} from "../../infrastructure/hooks/use-notes";
import { filterAndSort } from "../../domain/services/note-filter";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHomePage() {
  const { notes, isLoading } = useAllNotes();
  const stats = useNoteCounts();
  const { user } = useCurrentUser();
  const router = useRouter();

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const recentHeaderRef = useRef<HTMLDivElement>(null);
  const recentGridRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  const recentNotes = useMemo(
    () =>
      filterAndSort(notes ?? [], { status: "active", sortOrder: "desc" }).slice(
        0,
        4,
      ),
    [notes],
  );

  useEffect(() => {
    if (isLoading || animated.current) return;
    animated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
      )
        .fromTo(
          gsap.utils.toArray(statsRef.current?.children ?? []),
          { opacity: 0, y: 24, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.55,
            stagger: 0.08,
          },
          "-=0.35",
        )
        .fromTo(
          recentHeaderRef.current,
          { opacity: 0, y: 16, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          gsap.utils.toArray(recentGridRef.current?.children ?? []),
          { opacity: 0, y: 20, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.07,
          },
          "-=0.25",
        );
    });

    return () => ctx.revert();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statsData = [
    {
      label: "Total Notes",
      value: stats.total,
      icon: <FileText size={15} />,
      variant: "default" as const,
      description: "in your collection",
    },
    {
      label: "Active",
      value: stats.active,
      icon: <Feather size={15} />,
      variant: "success" as const,
      description: "ready to edit",
    },
    {
      label: "Favorites",
      value: stats.favorite,
      icon: <Star size={15} />,
      variant: "warning" as const,
      description: "starred notes",
    },
    {
      label: "Archived",
      value: stats.archived,
      icon: <Archive size={15} />,
      variant: "info" as const,
      description: "stored away",
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div ref={headerRef} className="flex items-start justify-between gap-4">
        <div>
          <p className="text-zinc-600 text-xs mb-2 tracking-wide">{today}</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {getGreeting()},{" "}
            <span className="text-zinc-400">{firstName}.</span>
          </h1>
          <p className="text-zinc-600 text-sm mt-2">
            {stats.total === 0
              ? "Start writing your first note."
              : `${stats.active} active note${stats.active !== 1 ? "s" : ""} — keep the momentum going.`}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => router.push("/dashboard/notes")}
        >
          New note
        </Button>
      </div>

      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((stat) => (
          <Card key={stat.label} variant="default" padding="none">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <IconBox icon={stat.icon} variant={stat.variant} size="sm" />
                <span className="text-zinc-700 text-[10px] tracking-wide uppercase">
                  {stat.description}
                </span>
              </div>
              <div>
                <p className="text-4xl font-semibold text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="text-zinc-600 text-xs mt-1">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div
          ref={recentHeaderRef}
          className="flex items-center justify-between mb-5"
        >
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-zinc-600" />
            <h2 className="text-sm font-medium text-zinc-400">
              Recently updated
            </h2>
            {recentNotes.length > 0 && (
              <span className="text-[10px] text-zinc-700 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                {recentNotes.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/notes")}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
          >
            View all
            <ArrowRight size={11} />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <Card variant="ghost" padding="none">
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <IconBox
                icon={<FileText size={18} />}
                variant="default"
                size="lg"
              />
              <div>
                <p className="text-zinc-400 text-sm font-medium">
                  No notes yet
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  Create your first note to get started
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => router.push("/dashboard/notes")}
              >
                Create note
              </Button>
            </div>
          </Card>
        ) : (
          <div
            ref={recentGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {recentNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onClick={() => router.push(`/dashboard/notes/${note.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
