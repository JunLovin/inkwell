"use client";

import { useEffect, useRef } from "react";
import { Plus, FileText } from "lucide-react";
import gsap from "gsap";

import { Button } from "@/shared/ui/button";
import type { Tag } from "@/modules/tags";
import type { Folder, FolderId } from "@/modules/folders";
import { NoteCard } from "../note-card";
import type { Note, NoteId } from "../../../domain/entities/note";

export type TagsByNote = Map<NoteId, Tag[]>;
export type FoldersById = Map<FolderId, Folder>;

type NotesGridProps = {
  notes: Note[];
  tagsByNote?: TagsByNote;
  foldersById?: FoldersById;
  selectable?: boolean;
  selectedIds?: Set<NoteId>;
  onNoteClick?: (note: Note) => void;
  onCreateNote?: () => void;
  onFavorite?: (note: Note) => void;
  onArchive?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onRestore?: (note: Note) => void;
  onPin?: (note: Note) => void;
};

export function NotesGrid({
  notes,
  tagsByNote,
  foldersById,
  selectable = false,
  selectedIds,
  onNoteClick,
  onCreateNote,
  onFavorite,
  onArchive,
  onDelete,
  onRestore,
  onPin,
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
            tags={tagsByNote?.get(note._id)}
            folder={note.folderId ? foldersById?.get(note.folderId) : undefined}
            selectable={selectable}
            selected={selectedIds?.has(note._id)}
            onClick={() => onNoteClick?.(note)}
            onFavorite={onFavorite ? () => onFavorite(note) : undefined}
            onArchive={onArchive ? () => onArchive(note) : undefined}
            onDelete={onDelete ? () => onDelete(note) : undefined}
            onRestore={onRestore ? () => onRestore(note) : undefined}
            onPin={onPin ? () => onPin(note) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
