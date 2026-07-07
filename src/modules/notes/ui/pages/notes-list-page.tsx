"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  CheckSquare,
  Folder as FolderIcon,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Tag as TagIcon,
  Trash2,
  X as XIcon,
} from "lucide-react";

import { useToast } from "@/shared/hooks/use-toast";
import { useKeyboardShortcut } from "@/shared/hooks/use-keyboard-shortcut";
import { Button, Divider, Input, Loader, focusRingZinc } from "@/shared/ui";
import { Dropdown, DropdownTrigger } from "@/shared/ui/dropdown";

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
  tagSwatchClasses,
  useAllNoteTagLinks,
  useAllTags,
  type Tag,
  type TagId,
} from "@/modules/tags";
import {
  folderIconClasses,
  useAllFolders,
  type Folder,
  type FolderId,
} from "@/modules/folders";

export function NotesListPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTagParam = searchParams.get("tag");
  const initialFolderParam = searchParams.get("folder");

  const [isCreatingNote, setIsCreatingNote] = useState(false);
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

  const [tagParamKey, setTagParamKey] = useState(initialTagParam);
  if (initialTagParam !== tagParamKey) {
    setTagParamKey(initialTagParam);
    if (initialTagParam) {
      setSelectedTagIds((prev) =>
        prev.includes(initialTagParam as TagId)
          ? prev
          : [initialTagParam as TagId],
      );
    }
  }

  const [folderParamKey, setFolderParamKey] = useState(initialFolderParam);
  if (initialFolderParam !== folderParamKey) {
    setFolderParamKey(initialFolderParam);
    if (initialFolderParam) {
      setSelectedFolderId(initialFolderParam as FolderId);
    }
  }

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

  const handleStartCreate = () => setIsCreatingNote(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcut([
    {
      key: "k",
      meta: true,
      handler: (e) => {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      },
    },
    {
      key: "n",
      meta: true,
      handler: (e) => {
        e.preventDefault();
        handleStartCreate();
      },
    },
  ]);

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
              onClick={handleStartCreate}
            >
              New note
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes... (⌘K)"
              leading={<Search size={14} />}
            />
          </div>

          <Dropdown
            width={220}
            trigger={
              <DropdownTrigger>
                <FolderIcon
                  size={13}
                  className={
                    activeFolder
                      ? folderIconClasses(activeFolder.color)
                      : "text-zinc-500"
                  }
                />
                <span className="text-xs truncate max-w-[120px]">
                  {activeFolder ? activeFolder.name : "All folders"}
                </span>
              </DropdownTrigger>
            }
            items={[
              {
                id: "",
                label: "All folders",
                icon: <FolderIcon size={13} className="text-zinc-500" />,
                checked: !selectedFolderId,
              },
              ...(allFolders ?? []).map((folder) => ({
                id: folder._id,
                label: folder.name,
                icon: (
                  <FolderIcon
                    size={12}
                    className={folderIconClasses(folder.color)}
                  />
                ),
                checked: selectedFolderId === folder._id,
              })),
            ]}
            onSelect={(id) => setSelectedFolderId(id ? (id as FolderId) : null)}
          />

          <Dropdown
            width={220}
            closeOnSelect={false}
            trigger={
              <DropdownTrigger>
                <TagIcon size={13} className="text-zinc-500" />
                <span className="text-xs">Tags</span>
                {selectedTagIds.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-zinc-700 text-zinc-100 text-[10px] leading-none">
                    {selectedTagIds.length}
                  </span>
                )}
              </DropdownTrigger>
            }
            items={[
              ...(allTags ?? []).map((tag) => ({
                id: tag._id,
                label: tag.name,
                icon: (
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${tagSwatchClasses(tag.color)}`}
                  />
                ),
                checked: selectedTagIds.includes(tag._id),
              })),
              ...(selectedTagIds.length > 0
                ? ([
                    { id: "__sep", label: "", separator: true },
                    {
                      id: "__clear",
                      label: "Clear tags",
                      variant: "danger" as const,
                    },
                  ] as const)
                : []),
            ]}
            onSelect={(id) => {
              if (id === "__clear") {
                setSelectedTagIds([]);
                return;
              }
              setSelectedTagIds((prev) =>
                prev.includes(id as TagId)
                  ? prev.filter((t) => t !== (id as TagId))
                  : [...prev, id as TagId],
              );
            }}
          />

          <button
            type="button"
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            aria-label={
              sortOrder === "desc" ? "Sort newest first" : "Sort oldest first"
            }
            className={`flex items-center gap-2 px-3 h-10 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-sm transition-all duration-200 shrink-0 cursor-pointer ${focusRingZinc}`}
          >
            {sortOrder === "desc" ? (
              <SortDesc size={14} />
            ) : (
              <SortAsc size={14} />
            )}
            <span className="hidden sm:inline text-xs">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>

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
            onCreateNote={handleStartCreate}
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

      <NoteDrawer
        note={selectedNote}
        open={isCreatingNote || !!selectedNote}
        onClose={() => {
          setIsCreatingNote(false);
          setSelectedNote(null);
        }}
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
