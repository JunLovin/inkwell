"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Search, SortAsc, SortDesc, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

import { useToast } from "@/shared/hooks/use-toast";
import { Divider, Input, Loader } from "@/shared/ui";
import { NoteCard } from "../components/note-card";
import { NoteDrawer } from "../components/note-drawer";
import { useFavoriteNotes } from "../../infrastructure/hooks/use-notes";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { Note } from "../../domain/entities/note";
import type { SortOrder } from "../../domain/services/note-filter";

export function FavoriteNotesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { notes, isLoading } = useFavoriteNotes(search, sortOrder);
  const { unfavoriteNote, deleteNote } = useNoteActions();

  useEffect(() => {
    if (isLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll("[data-card]");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power3.out",
            stagger: { amount: 0.3, ease: "power2.out" },
            delay: 0.2,
          },
        );
      }
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

  const isEmpty = notes.length === 0 && !search;
  const isSearchEmpty = notes.length === 0 && !!search;

  return (
    <>
      <div className="flex flex-col h-full px-6 py-6 gap-6">
        <div ref={headerRef} className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400/40" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-light tracking-tight">
                  Favorites
                </h1>
                <p className="text-zinc-600 text-xs mt-0.5">
                  {notes.length} {notes.length === 1 ? "note" : "notes"} saved
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((o) => (o === "desc" ? "asc" : "desc"))
              }
              className="flex items-center gap-2 px-3 h-11.5 rounded-2xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 text-xs transition-all duration-200 shrink-0 cursor-pointer"
            >
              {sortOrder === "desc" ? (
                <SortDesc size={15} />
              ) : (
                <SortAsc size={15} />
              )}
              <span className="hidden sm:inline">
                {sortOrder === "desc" ? "Newest first" : "Oldest first"}
              </span>
            </button>
          </div>

          {!isEmpty && (
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search favorites..."
              leading={<Search size={14} />}
            />
          )}

          <Divider />
        </div>

        {isEmpty && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 py-20">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Star className="w-7 h-7 text-amber-400/50" />
            </div>
            <div className="text-center">
              <p className="text-zinc-300 text-base font-light">
                No favorites yet
              </p>
              <p className="text-zinc-600 text-sm mt-1 max-w-xs">
                Star notes from the notes page to find them here quickly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/notes")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm transition-all duration-200"
            >
              Browse notes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isSearchEmpty && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Search size={18} className="text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-zinc-500 text-sm">
                No results for &ldquo;{search}&rdquo;
              </p>
              <p className="text-zinc-700 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {notes.map((note) => (
              <div key={note._id} data-card>
                <NoteCard
                  note={note}
                  onClick={() => setSelectedNote(note)}
                  onFavorite={async () => {
                    try {
                      await unfavoriteNote(note._id);
                      toast.success({ title: "Removed from favorites" });
                    } catch {
                      toast.error({ title: "Failed to update favorite" });
                    }
                  }}
                  onDelete={async () => {
                    try {
                      await deleteNote(note._id);
                      toast.success({ title: "Note deleted" });
                    } catch {
                      toast.error({ title: "Failed to delete note" });
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <NoteDrawer
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
}
