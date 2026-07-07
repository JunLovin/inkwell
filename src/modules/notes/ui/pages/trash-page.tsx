"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Search, SortAsc, SortDesc, RotateCcw } from "lucide-react";
import gsap from "gsap";

import { useToast } from "@/shared/hooks/use-toast";
import { Button, Divider, Input, Loader } from "@/shared/ui";
import { Dialog } from "@/shared/ui/dialog";
import { NotesGrid } from "../components/notes-grid";
import { useDeletedNotes } from "../../infrastructure/hooks/use-notes";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { Note, NoteId } from "../../domain/entities/note";
import type { SortOrder } from "../../domain/services/note-filter";

export function TrashPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [emptyOpen, setEmptyOpen] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: NoteId;
    title: string;
  } | null>(null);
  const [deletingSingle, setDeletingSingle] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { notes, isLoading } = useDeletedNotes(search, sortOrder);
  const { restoreNote, hardDeleteNote, bulkHardDeleteNotes } = useNoteActions();

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

  const handleEmptyTrash = async () => {
    if (emptying || notes.length === 0) return;
    try {
      setEmptying(true);
      const result = await bulkHardDeleteNotes(notes.map((n) => n._id));
      toast.success({
        title:
          result.processed === 1
            ? "Note permanently deleted"
            : `${result.processed} notes permanently deleted`,
      });
    } catch {
      toast.error({ title: "Failed to empty trash" });
    } finally {
      setEmptying(false);
      setEmptyOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-6 py-6 gap-6">
      <div
        ref={headerRef}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 size={15} className="text-red-400" />
            </div>
            <h1 className="text-white text-2xl font-light tracking-tight">
              Trash
            </h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 ml-10.5">
            {notes.length} {notes.length === 1 ? "note" : "notes"} in trash
          </p>
        </div>

        {notes.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={() => setEmptyOpen(true)}
          >
            Empty trash
          </Button>
        )}
      </div>

      <div ref={contentRef} className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trash..."
              leading={<Search size={14} />}
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
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
              <p className="text-zinc-500 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/5 border border-red-500/15 flex items-center justify-center">
              <Trash2 size={22} className="text-red-500/60" />
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm font-medium">
                Trash is empty
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Deleted notes appear here until permanently removed
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <RotateCcw size={12} className="text-red-400/60" />
              <p className="text-zinc-600 text-xs">
                Hover a card to restore or permanently delete
              </p>
            </div>
            <NotesGrid
              notes={notes}
              onRestore={async (note) => {
                try {
                  await restoreNote(note._id);
                  toast.success({ title: "Note restored" });
                } catch {
                  toast.error({ title: "Failed to restore note" });
                }
              }}
              onDelete={(note: Note) => {
                setPendingDelete({
                  id: note._id,
                  title: note.title || "Untitled",
                });
              }}
            />
          </div>
        )}
      </div>

      <Dialog
        open={emptyOpen}
        onClose={() => {
          if (!emptying) setEmptyOpen(false);
        }}
        title="Empty trash?"
        description={`Permanently delete ${notes.length} note${notes.length === 1 ? "" : "s"}. This cannot be undone.`}
        size="md"
        actions={[
          {
            label: "Cancel",
            variant: "ghost",
            onClick: () => {
              if (!emptying) setEmptyOpen(false);
            },
          },
          {
            label: "Permanently delete",
            variant: "danger",
            loading: emptying,
            onClick: handleEmptyTrash,
          },
        ]}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => {
          if (!deletingSingle) setPendingDelete(null);
        }}
        title="Delete this note?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently deleted. This cannot be undone.`
            : ""
        }
        size="md"
        actions={[
          {
            label: "Cancel",
            variant: "ghost",
            onClick: () => {
              if (!deletingSingle) setPendingDelete(null);
            },
          },
          {
            label: "Permanently delete",
            variant: "danger",
            loading: deletingSingle,
            onClick: async () => {
              if (!pendingDelete) return;
              try {
                setDeletingSingle(true);
                await hardDeleteNote(pendingDelete.id);
                toast.success({ title: "Note permanently deleted" });
              } catch {
                toast.error({ title: "Failed to delete note" });
              } finally {
                setDeletingSingle(false);
                setPendingDelete(null);
              }
            },
          },
        ]}
      />
    </div>
  );
}
