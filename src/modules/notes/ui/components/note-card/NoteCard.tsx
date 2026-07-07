"use client";

import {
  Star,
  Trash2,
  Archive,
  RotateCcw,
  Pin,
  PinOff,
  Check,
  Folder as FolderIcon,
} from "lucide-react";
import { Tooltip } from "@/shared/ui/tooltip";
import { focusRingZinc } from "@/shared/ui";
import { TagChip, type Tag } from "@/modules/tags";
import { folderBadgeClasses, type Folder } from "@/modules/folders";
import type { Note } from "../../../domain/entities/note";
import { timeAgo } from "../../../domain/services/time-ago";

const defaultCovers = [
  "from-zinc-800 to-zinc-900",
  "from-zinc-900 to-zinc-950",
  "from-slate-800 to-slate-900",
  "from-neutral-800 to-neutral-900",
];

type NoteCardProps = {
  note: Note;
  tags?: Tag[];
  folder?: Folder;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onPin?: () => void;
};

export function NoteCard({
  note,
  tags,
  folder,
  selectable = false,
  selected = false,
  onClick,
  onFavorite,
  onArchive,
  onDelete,
  onRestore,
  onPin,
}: NoteCardProps) {
  const cover = defaultCovers[note._id.charCodeAt(0) % defaultCovers.length];
  const isFavorite = note.isFavorite ?? false;
  const isPinned = note.isPinned ?? false;
  const hasActions =
    !selectable && (onFavorite || onArchive || onDelete || onRestore || onPin);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selectable ? selected : undefined}
      className={`group w-full text-left bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 ${
        selected
          ? "border-emerald-500/60 ring-1 ring-emerald-500/30"
          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30"
      }`}
    >
      <div
        className={`h-28 bg-gradient-to-br ${cover} relative overflow-hidden`}
      >
        {selectable && (
          <div
            className={`absolute top-3 left-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              selected
                ? "bg-emerald-500 border-emerald-500 text-zinc-950"
                : "bg-zinc-950/60 border-zinc-600 text-transparent"
            }`}
          >
            <Check className="w-3 h-3" strokeWidth={3} />
          </div>
        )}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 0, transparent 50%)`,
            backgroundSize: "12px 12px",
          }}
        />
        {isFavorite && !onFavorite && (
          <div className="absolute top-3 left-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm" />
          </div>
        )}
        {isPinned && (
          <div className="absolute top-3 right-3">
            <Pin className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40 drop-shadow-sm" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          {folder && (
            <div
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-medium tracking-tight mb-1.5 ${folderBadgeClasses(folder.color)}`}
            >
              <FolderIcon className="w-2.5 h-2.5" />
              <span className="truncate max-w-[120px]">{folder.name}</span>
            </div>
          )}
          <h3 className="text-sm font-medium text-white truncate group-hover:text-zinc-100 transition-colors leading-snug">
            {note.title || "Untitled"}
          </h3>
          <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {note.preview ?? ""}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 4).map((tag) => (
                <TagChip
                  key={tag._id}
                  name={tag.name}
                  color={tag.color}
                  size="sm"
                />
              ))}
              {tags.length > 4 && (
                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5">
                  +{tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {note.updatedAt ? (
            <span className="text-[10px] text-zinc-700">
              {timeAgo(new Date(note.updatedAt))}
            </span>
          ) : (
            <span />
          )}

          {hasActions && (
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {onPin && (
                <Tooltip content={isPinned ? "Unpin note" : "Pin note"}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin();
                    }}
                    aria-label={isPinned ? "Unpin note" : "Pin note"}
                    className={`w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg transition-colors ${
                      isPinned
                        ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        : "text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {isPinned ? (
                      <PinOff className="w-3.5 h-3.5" />
                    ) : (
                      <Pin className="w-3.5 h-3.5" />
                    )}
                  </button>
                </Tooltip>
              )}
              {onFavorite && (
                <Tooltip
                  content={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite();
                    }}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    className={`w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${focusRingZinc} ${
                      isFavorite
                        ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        : "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </Tooltip>
              )}
              {onArchive && (
                <Tooltip content="Archive note">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                    aria-label="Archive note"
                    className="w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/60 transition-colors cursor-pointer ${focusRingZinc}"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
              {onRestore && (
                <Tooltip content="Restore note">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore();
                    }}
                    aria-label="Restore note"
                    className="w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer ${focusRingZinc}"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip content="Delete note">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    aria-label="Delete note"
                    className="w-11 h-11 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${focusRingZinc}"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
