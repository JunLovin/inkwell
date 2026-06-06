"use client";

import { Star, Trash2, Archive, RotateCcw } from "lucide-react";
import { Tooltip } from "@/shared/ui/tooltip";
import type { Note } from "../../../domain/entities/note";

const defaultCovers = [
  "from-zinc-800 to-zinc-900",
  "from-zinc-900 to-zinc-950",
  "from-slate-800 to-slate-900",
  "from-neutral-800 to-neutral-900",
];

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type NoteCardProps = {
  note: Partial<Note>;
  onClick?: () => void;
  onFavorite?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
};

export function NoteCard({
  note,
  onClick,
  onFavorite,
  onArchive,
  onDelete,
  onRestore,
}: NoteCardProps) {
  const cover = defaultCovers[note._id!.charCodeAt(0) % defaultCovers.length];
  const isFavorite = note.isFavorite ?? false;
  const hasActions = onFavorite || onArchive || onDelete || onRestore;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:bg-zinc-800/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
    >
      <div className={`h-28 bg-gradient-to-br ${cover} relative overflow-hidden`}>
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
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium text-white truncate group-hover:text-zinc-100 transition-colors leading-snug">
            {note.title || "Untitled"}
          </h3>
          {note.preview && (
            <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
              {note.preview}
            </p>
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
                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
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
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/60 transition-colors"
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
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
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
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
