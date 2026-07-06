"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Folder as FolderIcon, FolderPlus, Plus } from "lucide-react";

import { Dialog } from "@/shared/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";
import {
  folderIconClasses,
  pickFolderColor,
} from "../../../domain/services/folder-color";
import {
  useAllFolders,
  useFolderActions,
} from "../../../infrastructure/hooks/use-folders";

export function FolderQuickCreate() {
  const { toast } = useToast();
  const { folders } = useAllFolders();
  const { createFolder } = useFolderActions();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
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

  const handleCreate = async () => {
    if (!trimmed || pending) return;
    try {
      setPending(true);
      const color = pickFolderColor(trimmed);
      await createFolder(trimmed, color);
      toast.success({ title: `Folder "${trimmed}" created` });
      setOpen(false);
    } catch (err) {
      toast.error({
        title: "Could not create folder",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!exactMatch && trimmed) handleCreate();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="New folder"
        className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
      >
        <Plus size={12} />
      </button>

      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        size="sm"
        bare
      >
        <div className="p-3">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-zinc-800/40 border border-zinc-800">
            <FolderIcon size={14} className="text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find or create folder…"
              aria-label="Find or create folder"
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
              disabled={pending}
            />
          </div>

          <div className="max-h-64 overflow-y-auto mt-2 flex flex-col gap-0.5">
            {filtered.length === 0 && !trimmed && (
              <div className="flex flex-col items-center gap-1.5 py-6 text-zinc-600">
                <FolderIcon className="w-4 h-4" />
                <span className="text-[11px]">No folders yet</span>
                <span className="text-[10px]">Type a name to create one</span>
              </div>
            )}

            {filtered.map((folder) => (
              <div
                key={folder._id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-zinc-400"
              >
                <FolderIcon
                  className={`w-3 h-3 shrink-0 ${folderIconClasses(folder.color)}`}
                />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-[10px] text-zinc-700">exists</span>
              </div>
            ))}

            {trimmed && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={pending}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-left text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-60"
              >
                <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">
                  Create &ldquo;{trimmed}&rdquo;
                </span>
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
