"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Plus, Search, SortAsc, SortDesc } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/lib/hooks/useToast";

import { Button, Divider, Input, Loader } from "@/shared/components/ui";
import { Dialog } from "@/shared/components/ui/dialog";
import { NoteEditor, SaveStatus } from "@/shared/components/ui/note/NoteEditor";
import { Note } from "@/shared/components/ui/note/NoteCard";
import { NoteDrawer, NotesGrid } from "@/shared/components/ui/note";

type SortOrder = "asc" | "desc";

export default function NotesPage() {
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

  const notes = useQuery(api.notes.getNotes, {});
  const createNote = useMutation(api.notes.addNote);

  const handleOpenNoteDialog = () => {
    setDraftTitle("");
    setDraftContent("");
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
    const title = draftTitle.trim() || "Untitled";
    const preview = draftPreview.trim();

    try {
      setSaveStatus("saving");
      await createNote({
        title,
        content: draftContent,
        preview,
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
  }, [draftTitle, draftContent, createNote, toast]);

  const handleContentChange = useCallback((content: string, preview: string) => {
    setDraftContent(content);
    setDraftPreview(preview);
  }, []);

  const filteredNotes: Note[] = useMemo(() => {
    if (!notes) return [];
    return [...notes.filter((n) => !n.isDeleted && !n.isArchived && !n.isFavorite)]
      .filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aTime = a.updatedAt ?? a._creationTime;
        const bTime = b.updatedAt ?? b._creationTime;
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      });
  }, [notes, search, sortOrder]);

  if (!notes) {
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

        {filteredNotes.length === 0 && search ? (
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
            notes={filteredNotes.map((n) => ({
              ...n,
              _id: n._id,
              title: n.title,
              preview: n.preview,
              updatedAt: n.updatedAt,
            }))}
            onNoteClick={setSelectedNote}
            onCreateNote={handleOpenNoteDialog}
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
