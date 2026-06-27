"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Tag as TagIcon } from "lucide-react";

import type { Id } from "@/convex/_generated/dataModel";
import { TagChip } from "../tag-chip";
import {
  pickColorFromName,
  tagSwatchClasses,
} from "../../../domain/services/tag-color";
import {
  useAllTags,
  useTagActions,
  useTagsForNote,
} from "../../../infrastructure/hooks/use-tags";

type TagPickerProps = {
  noteId: Id<"notes"> | undefined;
};

export function TagPicker({ noteId }: TagPickerProps) {
  const { tags: allTags } = useAllTags();
  const { tags: assigned } = useTagsForNote(noteId);
  const { createTag, assignTagToNote, unassignTagFromNote } = useTagActions();

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

  const assignedIds = useMemo(
    () => new Set((assigned ?? []).map((t) => t._id)),
    [assigned],
  );

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    const all = allTags ?? [];
    if (!trimmed) return all;
    const lower = trimmed.toLowerCase();
    return all.filter((t) => t.name.toLowerCase().includes(lower));
  }, [allTags, trimmed]);

  const exactMatch = useMemo(
    () =>
      (allTags ?? []).find(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
      ),
    [allTags, trimmed],
  );

  const handleToggle = async (tagId: Id<"tags">) => {
    if (!noteId) return;
    try {
      if (assignedIds.has(tagId)) {
        await unassignTagFromNote(noteId, tagId);
      } else {
        await assignTagToNote(noteId, tagId);
      }
    } catch {}
  };

  const handleCreate = async () => {
    if (!noteId || !trimmed) return;
    try {
      const color = pickColorFromName(trimmed);
      const newId = await createTag(trimmed, color);
      await assignTagToNote(noteId, newId);
      setQuery("");
    } catch {}
  };

  const handleRemove = async (tagId: Id<"tags">) => {
    if (!noteId) return;
    try {
      await unassignTagFromNote(noteId, tagId);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (exactMatch) {
        if (!assignedIds.has(exactMatch._id)) handleToggle(exactMatch._id);
      } else if (trimmed) {
        handleCreate();
      }
    }
  };

  if (!noteId) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(assigned ?? []).map((tag) => (
        <TagChip
          key={tag._id}
          name={tag.name}
          color={tag.color}
          size="sm"
          onRemove={() => handleRemove(tag._id)}
        />
      ))}

      <div ref={containerRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Add tag"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 text-[10px] transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Tag
        </button>

        {open && (
          <div
            className="absolute top-full left-0 mt-2 z-30 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl shadow-black/40 p-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find or create tag…"
              aria-label="Find or create tag"
              className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-700"
            />

            <div className="max-h-48 overflow-y-auto mt-2 flex flex-col gap-0.5">
              {filtered.length === 0 && !trimmed && (
                <div className="flex flex-col items-center gap-1.5 py-4 text-zinc-600">
                  <TagIcon className="w-4 h-4" />
                  <span className="text-[11px]">No tags yet</span>
                </div>
              )}
              {filtered.map((tag) => {
                const isAssigned = assignedIds.has(tag._id);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleToggle(tag._id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      isAssigned
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${tagSwatchClasses(tag.color)} shrink-0`}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                  </button>
                );
              })}
              {trimmed && !exactMatch && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 shrink-0" />
                  <span className="flex-1 truncate">
                    Create &ldquo;{trimmed}&rdquo;
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
