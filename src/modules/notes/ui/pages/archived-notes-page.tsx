"use client";

import { useState, useRef, useEffect } from "react";
import { Archive, Search, SortAsc, SortDesc, RotateCcw } from "lucide-react";
import gsap from "gsap";

import { useToast } from "@/shared/hooks/use-toast";
import { Divider, Input, Loader } from "@/shared/ui";
import { NoteDrawer } from "../components/note-drawer";
import { NotesGrid } from "../components/notes-grid";
import { useArchivedNotes } from "../../infrastructure/hooks/use-notes";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { Note } from "../../domain/entities/note";
import type { SortOrder } from "../../domain/services/note-filter";

export function ArchivedNotesPage() {
  const { toast } = useToast();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { notes, isLoading } = useArchivedNotes(search, sortOrder);
  const { restoreNote, deleteNote } = useNoteActions();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          headerRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.5 },
        )
        .fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.25",
        );
    });

    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full px-6 py-6 gap-6">
        <div
          ref={headerRef}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Archive size={15} className="text-blue-400" />
              </div>
              <h1 className="text-white text-2xl font-light tracking-tight">
                Archived
              </h1>
            </div>
            <p className="text-zinc-600 text-xs mt-1 ml-10.5">
              {notes.length} {notes.length === 1 ? "note" : "notes"} archived
            </p>
          </div>
        </div>

        <div ref={contentRef} className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archived notes..."
                leading={<Search size={14} />}
              />
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

          <Divider />

          {notes.length === 0 && search ? (
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
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-center">
                <Archive size={22} className="text-blue-500/60" />
              </div>
              <div className="text-center">
                <p className="text-zinc-400 text-sm font-medium">
                  No archived notes
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  Notes you archive will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <RotateCcw size={12} className="text-blue-400/60" />
                <p className="text-zinc-600 text-xs">
                  Hover a card to restore or permanently delete
                </p>
              </div>
              <NotesGrid
                notes={notes}
                onNoteClick={setSelectedNote}
                onRestore={async (note) => {
                  try {
                    await restoreNote(note._id);
                    toast.success({
                      title: "Note restored",
                      description: "The note is back in your notes.",
                    });
                  } catch {
                    toast.error({ title: "Failed to restore note" });
                  }
                }}
                onDelete={async (note) => {
                  try {
                    await deleteNote(note._id);
                    toast.success({ title: "Note deleted" });
                  } catch {
                    toast.error({ title: "Failed to delete note" });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <NoteDrawer
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
}
