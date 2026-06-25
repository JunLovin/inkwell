"use client";

import { useEffect, useRef } from "react";
import { Plus, FileText } from "lucide-react";
import gsap from "gsap";

import { Button } from "@/shared/ui/button";
import { NoteCard } from "../note-card";
import type { Note } from "../../../domain/entities/note";

type NotesGridProps = {
  notes: Note[];
  onNoteClick?: (note: Note) => void;
  onCreateNote?: () => void;
  onFavorite?: (note: Note) => void;
  onArchive?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onRestore?: (note: Note) => void;
};

export function NotesGrid({
  notes,
  onNoteClick,
  onCreateNote,
  onFavorite,
  onArchive,
  onDelete,
  onRestore,
}: NotesGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".note-card-anim");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        stagger: { amount: 0.3, ease: "power2.out" },
        ease: "power3.out",
      },
    );
  }, [notes.length]);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <FileText size={22} className="text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-zinc-400 text-sm font-medium">No notes yet</p>
          <p className="text-zinc-700 text-xs mt-1">
            Create your first note to get started
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={onCreateNote}
        >
          Create note
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {notes.map((note) => (
        <div key={note._id} className="note-card-anim">
          <NoteCard
            note={note}
            onClick={() => onNoteClick?.(note)}
            onFavorite={onFavorite ? () => onFavorite(note) : undefined}
            onArchive={onArchive ? () => onArchive(note) : undefined}
            onDelete={onDelete ? () => onDelete(note) : undefined}
            onRestore={onRestore ? () => onRestore(note) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
