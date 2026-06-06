"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Search, SortAsc, SortDesc } from "lucide-react";

import { useToast } from "@/shared/hooks/use-toast";
import { Button, Divider, Input, Loader } from "@/shared/ui";
import { Dialog } from "@/shared/ui/dialog";

import { NoteEditor, type SaveStatus } from "../components/note-editor";
import { NoteDrawer } from "../components/note-drawer";
import { NotesGrid } from "../components/notes-grid";
import { useActiveNotes } from "../../infrastructure/hooks/use-notes";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { Note } from "../../domain/entities/note";
import type { SortOrder } from "../../domain/services/note-filter";

export function NotesListPage() {
  const { toast } = useToast();

  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftPreview, setDraftPreview] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { notes, isLoading } = useActiveNotes(search, sortOrder);
  const { createNote, favoriteNote, unfavoriteNote, archiveNote, deleteNote } =
    useNoteActions();

  const handleOpenNoteDialog = () => {
    setDraftTitle("");
    setDraftContent("");
    setDraftPreview("");
    setSaveStatus("idle");
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("idle");
    setOpenNoteDialog(false);
    setDraftTitle("Untitled");
    setDraftContent("");
  };

  const handleCreateNote = useCallback(async () => {
    try {
      setSaveStatus("saving");
      await createNote({
        title: draftTitle,
        content: draftContent,
        preview: draftPreview,
      });
      setSaveStatus("saved");
      toast.success({
        title: "Note created",
        description: "Your note has been saved.",
      });
      handleCloseNoteDialog();
    } catch {
      setSaveStatus("idle");
      toast.error({
        title: "Failed to create note",
        description: "Something went wrong, try again later.",
      });
    }
  }, [draftTitle, draftContent, draftPreview, createNote, toast]);

  const handleContentChange = useCallback(
    (content: string, preview: string) => {
      setDraftContent(content);
      setDraftPreview(preview);
    },
    [],
  );

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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-white text-2xl font-light tracking-tight">
              Notes
            </h1>
            <p className="text-zinc-600 text-xs mt-0.5">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={15} />}
            iconPosition="left"
            onClick={handleOpenNoteDialog}
          >
            New note
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
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
              <p className="text-zinc-700 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        ) : (
          <NotesGrid
            notes={notes}
            onNoteClick={setSelectedNote}
            onCreateNote={handleOpenNoteDialog}
            onFavorite={async (note) => {
              try {
                if (note.isFavorite) {
                  await unfavoriteNote(note._id);
                  toast.success({ title: "Removed from favorites" });
                } else {
                  await favoriteNote(note._id);
                  toast.success({ title: "Added to favorites" });
                }
              } catch {
                toast.error({ title: "Failed to update favorite" });
              }
            }}
            onArchive={async (note) => {
              try {
                await archiveNote(note._id);
                toast.success({ title: "Note archived" });
              } catch {
                toast.error({ title: "Failed to archive note" });
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
        )}
      </div>

      <Dialog
        open={openNoteDialog}
        onClose={handleCloseNoteDialog}
        size="xl"
        bare
      >
        <NoteEditor
          initialTitle={draftTitle}
          initialContent={draftContent}
          onTitleChange={setDraftTitle}
          onContentChange={handleContentChange}
          onClose={handleCloseNoteDialog}
          saveStatus={saveStatus}
        />
        <div className="px-8 pb-6 flex justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCloseNoteDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saveStatus === "saving"}
            onClick={handleCreateNote}
          >
            Save note
          </Button>
        </div>
      </Dialog>

      <NoteDrawer
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </>
  );
}
