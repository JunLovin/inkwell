"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  CheckSquare,
  Folder as FolderIcon,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  X as XIcon,
} from "lucide-react";

import { useToast } from "@/shared/hooks/use-toast";
import { Button, Divider, Input, Loader } from "@/shared/ui";
import { Dialog } from "@/shared/ui/dialog";

import { NoteEditor } from "../components/note-editor";
import type { SaveStatus } from "../../domain/services/editor-constants";
import { NoteDrawer } from "../components/note-drawer";
import { NotesGrid } from "../components/notes-grid";
import {
  useActiveNotes,
  useNotesSearch,
} from "../../infrastructure/hooks/use-notes";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { Note, NoteId } from "../../domain/entities/note";
import {
  filterAndSort,
  type SortOrder,
} from "../../domain/services/note-filter";
import {
  buildNoteTagsIndex,
  noteMatchesAllTags,
  TagChip,
  useAllNoteTagLinks,
  useAllTags,
  type Tag,
  type TagId,
} from "@/modules/tags";
import {
  folderBadgeClasses,
  useAllFolders,
  type Folder,
  type FolderId,
} from "@/modules/folders";

export function NotesListPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTagParam = searchParams.get("tag");
  const initialFolderParam = searchParams.get("folder");

  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedTagIds, setSelectedTagIds] = useState<TagId[]>(
    initialTagParam ? [initialTagParam as TagId] : [],
  );
  const [selectedFolderId, setSelectedFolderId] = useState<FolderId | null>(
    initialFolderParam ? (initialFolderParam as FolderId) : null,
  );

  useEffect(() => {
    if (initialTagParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTagIds((prev) =>
        prev.includes(initialTagParam as TagId)
          ? prev
          : [initialTagParam as TagId],
      );
    }
  }, [initialTagParam]);

  useEffect(() => {
    if (initialFolderParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFolderId(initialFolderParam as FolderId);
    }
  }, [initialFolderParam]);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftPreview, setDraftPreview] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { notes: activeNotes, isLoading: activeLoading } = useActiveNotes(
    "",
    sortOrder,
  );
  const { notes: searchResults, isLoading: searchLoading } =
    useNotesSearch(debouncedSearch);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<NoteId>>(new Set());

  const toggleSelected = useCallback((id: NoteId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const isLoading = debouncedSearch ? searchLoading : activeLoading;

  const { tags: allTags } = useAllTags();
  const { links: tagLinks } = useAllNoteTagLinks();
  const { folders: allFolders } = useAllFolders();

  const foldersById = useMemo(() => {
    const result = new Map<FolderId, Folder>();
    for (const folder of allFolders ?? []) result.set(folder._id, folder);
    return result;
  }, [allFolders]);

  const activeFolder = selectedFolderId
    ? foldersById.get(selectedFolderId)
    : undefined;

  const tagIndex = useMemo(() => buildNoteTagsIndex(tagLinks), [tagLinks]);

  const tagsByNote = useMemo(() => {
    const tagMap = new Map((allTags ?? []).map((t) => [t._id, t]));
    const result = new Map<NoteId, Tag[]>();
    for (const [noteId, tagIds] of tagIndex) {
      const tags = tagIds
        .map((id) => tagMap.get(id))
        .filter((t): t is Tag => t !== undefined);
      if (tags.length > 0) result.set(noteId, tags);
    }
    return result;
  }, [allTags, tagIndex]);

  const notes = useMemo(() => {
    const base = !debouncedSearch
      ? activeNotes
      : filterAndSort(searchResults ?? [], {
          status: "active",
          sortOrder,
        });
    return base.filter((note) => {
      if (selectedFolderId && note.folderId !== selectedFolderId) return false;
      if (
        selectedTagIds.length > 0 &&
        !noteMatchesAllTags(tagIndex.get(note._id), selectedTagIds)
      ) {
        return false;
      }
      return true;
    });
  }, [
    debouncedSearch,
    activeNotes,
    searchResults,
    sortOrder,
    selectedTagIds,
    selectedFolderId,
    tagIndex,
  ]);
  const {
    createNote,
    favoriteNote,
    unfavoriteNote,
    archiveNote,
    deleteNote,
    pinNote,
    unpinNote,
    bulkArchiveNotes,
    bulkDeleteNotes,
  } = useNoteActions();

  const handleBulkArchive = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      const { processed, skipped } = await bulkArchiveNotes(
        Array.from(selectedIds),
      );
      const noun = processed === 1 ? "note" : "notes";
      toast.success({
        title: `${processed} ${noun} archived`,
        description: skipped > 0 ? `${skipped} skipped` : undefined,
      });
      exitSelectionMode();
    } catch {
      toast.error({ title: "Failed to archive notes" });
    }
  }, [bulkArchiveNotes, selectedIds, toast, exitSelectionMode]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      const { processed, skipped } = await bulkDeleteNotes(
        Array.from(selectedIds),
      );
      const noun = processed === 1 ? "note" : "notes";
      toast.success({
        title: `${processed} ${noun} deleted`,
        description: skipped > 0 ? `${skipped} skipped` : undefined,
      });
      exitSelectionMode();
    } catch {
      toast.error({ title: "Failed to delete notes" });
    }
  }, [bulkDeleteNotes, selectedIds, toast, exitSelectionMode]);

  const handleOpenNoteDialog = () => {
    setDraftTitle("");
    setDraftContent("");
    setDraftPreview("");
    setSaveStatus("idle");
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setSaveStatus("idle");
    setOpenNoteDialog(false);
    setDraftTitle("");
    setDraftContent("");
    setDraftPreview("");
  };

  const handleCreateNote = async () => {
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
  };

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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (selectionMode) exitSelectionMode();
                else setSelectionMode(true);
              }}
              className={`flex items-center gap-2 px-3 h-11.5 rounded-2xl border text-xs transition-all duration-200 shrink-0 cursor-pointer ${
                selectionMode
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              <CheckSquare size={15} />
              <span className="hidden sm:inline">
                {selectionMode ? "Done" : "Select"}
              </span>
            </button>

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

        {activeFolder && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs ${folderBadgeClasses(activeFolder.color)}`}
            >
              <FolderIcon className="w-3 h-3" />
              {activeFolder.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Clear folder
            </button>
          </div>
        )}

        {allTags && allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => {
              const selected = selectedTagIds.includes(tag._id);
              return (
                <TagChip
                  key={tag._id}
                  name={tag.name}
                  color={tag.color}
                  size="md"
                  selected={selected}
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      selected
                        ? prev.filter((id) => id !== tag._id)
                        : [...prev, tag._id],
                    )
                  }
                />
              );
            })}
            {selectedTagIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTagIds([])}
                className="text-[10px] text-zinc-600 hover:text-zinc-300 px-1.5 py-0.5 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <Divider />

        {notes.length === 0 && debouncedSearch ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Search size={18} className="text-zinc-700" />
            </div>
            <div className="text-center">
              <p className="text-zinc-500 text-sm">
                No results for &ldquo;{debouncedSearch}&rdquo;
              </p>
              <p className="text-zinc-700 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          </div>
        ) : (
          <NotesGrid
            notes={notes}
            tagsByNote={tagsByNote}
            foldersById={foldersById}
            selectable={selectionMode}
            selectedIds={selectedIds}
            onNoteClick={
              selectionMode
                ? (note) => toggleSelected(note._id)
                : setSelectedNote
            }
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
            onPin={async (note) => {
              try {
                if (note.isPinned) {
                  await unpinNote(note._id);
                  toast.success({ title: "Note unpinned" });
                } else {
                  await pinNote(note._id);
                  toast.success({ title: "Note pinned" });
                }
              } catch {
                toast.error({ title: "Failed to update pin" });
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

      {selectionMode && selectedIds.size > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/40 px-3 py-2"
        >
          <span className="text-xs text-zinc-400 px-2">
            {selectedIds.size} selected
          </span>
          <span className="w-px h-5 bg-zinc-800" />
          <button
            type="button"
            onClick={handleBulkArchive}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Archive size={14} />
            Archive
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <span className="w-px h-5 bg-zinc-800" />
          <button
            type="button"
            onClick={exitSelectionMode}
            aria-label="Clear selection"
            className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}
    </>
  );
}
