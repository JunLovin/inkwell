"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Folder as FolderIcon, FolderPlus, Plus } from "lucide-react";

import type { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/shared/hooks/use-toast";
import {
  folderBadgeClasses,
  folderIconClasses,
  pickFolderColor,
} from "../../../domain/services/folder-color";
import {
  useAllFolders,
  useFolderActions,
} from "../../../infrastructure/hooks/use-folders";

type FolderPickerProps = {
  noteId: Id<"notes"> | undefined;
  currentFolderId: Id<"folders"> | undefined | null;
};

export function FolderPicker({ noteId, currentFolderId }: FolderPickerProps) {
  const { toast } = useToast();
  const { folders } = useAllFolders();
  const { createAndAssignFolder, moveNoteToFolder, removeNoteFromFolder } =
    useFolderActions();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const trimmed = query.trim();

  const filtered = useMemo(() => {
    const all = folders ?? [];
    if (!trimmed) return all;
    const lower = trimmed.toLowerCase();
    return all.filter((f) => f.name.toLowerCase().includes(lower));
  }, [folders, trimmed]);

  const exactMatch = useMemo(
    () =>
      (folders ?? []).find(
        (f) => f.name.toLowerCase() === trimmed.toLowerCase(),
      ),
    [folders, trimmed],
  );

  const currentFolder = useMemo(
    () => (folders ?? []).find((f) => f._id === currentFolderId),
    [folders, currentFolderId],
  );

  const handleSelect = async (folderId: Id<"folders">) => {
    if (!noteId) return;
    try {
      await moveNoteToFolder(noteId, folderId);
      setOpen(false);
      setQuery("");
    } catch (err) {
      toast.error({
        title: "Could not move note",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleRemove = async () => {
    if (!noteId) return;
    try {
      await removeNoteFromFolder(noteId);
      setOpen(false);
    } catch (err) {
      toast.error({
        title: "Could not remove folder",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleCreate = async () => {
    if (!noteId || !trimmed) return;
    try {
      const color = pickFolderColor(trimmed);
      await createAndAssignFolder(noteId, trimmed, color);
      setQuery("");
      setOpen(false);
    } catch (err) {
      toast.error({
        title: "Could not create folder",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (exactMatch) handleSelect(exactMatch._id);
      else if (trimmed) handleCreate();
    }
  };

  if (!noteId) return null;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={currentFolder ? "Change folder" : "Move to folder"}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
          currentFolder
            ? folderBadgeClasses(currentFolder.color)
            : "border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
        }`}
      >
        <FolderIcon className="w-3 h-3" />
        <span className="truncate max-w-[140px]">
          {currentFolder ? currentFolder.name : "Folder"}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-30 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/40 p-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find or create folder…"
            aria-label="Find or create folder"
            className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
          />

          <div className="max-h-48 overflow-y-auto mt-2 flex flex-col gap-0.5">
            {currentFolder && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <span className="w-3 h-3 shrink-0" />
                <span className="flex-1 truncate">Remove from folder</span>
              </button>
            )}

            {filtered.length === 0 && !trimmed && !currentFolder && (
              <div className="flex flex-col items-center gap-1.5 py-4 text-zinc-600">
                <FolderIcon className="w-4 h-4" />
                <span className="text-[11px]">No folders yet</span>
              </div>
            )}

            {filtered.map((folder) => {
              const isCurrent = folder._id === currentFolderId;
              return (
                <button
                  key={folder._id}
                  type="button"
                  onClick={() => handleSelect(folder._id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <FolderIcon
                    className={`w-3 h-3 shrink-0 ${folderIconClasses(folder.color)}`}
                  />
                  <span className="flex-1 truncate">{folder.name}</span>
                </button>
              );
            })}

            {trimmed && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3 h-3 shrink-0" />
                <span className="flex-1 truncate">
                  Create &ldquo;{trimmed}&rdquo;
                </span>
              </button>
            )}

            {!trimmed && (folders ?? []).length === 0 && currentFolder && (
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-zinc-500 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 shrink-0" />
                <span className="flex-1 truncate">Type to create</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
