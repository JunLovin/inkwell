"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Archive, Trash2, RotateCcw, Clock } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";

import { Drawer } from "@/shared/ui/drawer";
import { Tooltip } from "@/shared/ui/tooltip";
import { focusRingZinc } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { createEditorConfig, EditorPluginsBundle } from "@/lib/lexical";
import { TagPicker } from "@/modules/tags";
import { FolderPicker } from "@/modules/folders";
import { useNoteActions } from "../../../infrastructure/hooks/use-note-actions";
import { useAutoSaveNote } from "../../../infrastructure/hooks/use-autosave-note";
import type { Note, NoteId } from "../../../domain/entities/note";
import {
  PREVIEW_CHAR_LIMIT,
  saveStatusColor,
  saveStatusShortLabel,
} from "../../../domain/services/editor-constants";
import { timeAgo } from "../../../domain/services/time-ago";

type NoteDrawerProps = {
  note: Note | null;
  open: boolean;
  onClose: () => void;
};

type DraftNote = {
  id: NoteId;
  slug: string;
  createdAt: number;
};

export function NoteDrawer({ note, open, onClose }: NoteDrawerProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    createNote,
    updateNote,
    archiveNote,
    restoreNote,
    deleteNote,
    favoriteNote,
    unfavoriteNote,
  } = useNoteActions();

  const [draftNote, setDraftNote] = useState<DraftNote | null>(null);
  const hasCreatedRef = useRef(false);

  const activeNoteId: NoteId | undefined = note?._id ?? draftNote?.id;
  const activeSlug: string | undefined = note?.slug ?? draftNote?.slug;

  const { scheduleAutoSave, saveStatus } = useAutoSaveNote({
    noteId: activeNoteId,
    updateNote,
  });

  const [titleDraft, setTitleDraft] = useState("");
  const [contentJson, setContentJson] = useState("");
  const [syncedNoteId, setSyncedNoteId] = useState<NoteId | null>(null);

  const previewRef = useRef<string>("");
  const editorRef = useRef<LexicalEditor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const isCreateMode = open && !note;

  if (note && note._id !== syncedNoteId) {
    setSyncedNoteId(note._id);
    setTitleDraft(note.title || "");
    setContentJson(note.content ?? "");
  }

  const [openPrev, setOpenPrev] = useState(open);
  if (open !== openPrev) {
    setOpenPrev(open);
    if (!open) {
      setDraftNote(null);
      setTitleDraft("");
      setContentJson("");
      setSyncedNoteId(null);
    }
  }

  useEffect(() => {
    if (open) return;
    hasCreatedRef.current = false;
    previewRef.current = "";
  }, [open]);

  useEffect(() => {
    if (!open || !isCreateMode || hasCreatedRef.current) return;
    hasCreatedRef.current = true;
    (async () => {
      try {
        const created = await createNote({
          title: "",
          content: "",
          preview: "",
        });
        setDraftNote({ ...created, createdAt: Date.now() });
      } catch {
        hasCreatedRef.current = false;
        toast.error({ title: "Failed to create note" });
        onClose();
      }
    })();
  }, [open, isCreateMode, createNote, toast, onClose]);

  useEffect(() => {
    if (!open) return;
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [open, syncedNoteId]);

  const editorConfig = useMemo(
    () => createEditorConfig("inkwell-note-drawer"),
    [],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setTitleDraft(val);
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
      scheduleAutoSave(val, contentJson, previewRef.current);
    },
    [contentJson, scheduleAutoSave],
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editorRef.current?.focus();
      }
    },
    [],
  );

  const handleDeleteNote = useCallback(async () => {
    if (!activeNoteId) return;
    try {
      await deleteNote(activeNoteId);
      onClose();
      toast.success({ title: "Note deleted" });
    } catch {
      toast.error({ title: "Failed to delete note" });
    }
  }, [activeNoteId, deleteNote, onClose, toast]);

  const handleArchiveNote = useCallback(async () => {
    if (!activeNoteId) return;
    try {
      await archiveNote(activeNoteId);
      onClose();
      toast.success({ title: "Note archived" });
    } catch {
      toast.error({ title: "Failed to archive note" });
    }
  }, [activeNoteId, archiveNote, onClose, toast]);

  const handleRestoreNote = useCallback(async () => {
    if (!activeNoteId) return;
    try {
      await restoreNote(activeNoteId);
      onClose();
      toast.success({ title: "Note restored" });
    } catch {
      toast.error({ title: "Failed to restore note" });
    }
  }, [activeNoteId, restoreNote, onClose, toast]);

  const handleMarkAsFavorite = useCallback(async () => {
    if (!activeNoteId || !note) return;
    try {
      if (note.isFavorite) {
        await unfavoriteNote(activeNoteId);
        toast.success({ title: "Removed from favorites" });
      } else {
        await favoriteNote(activeNoteId);
        toast.success({ title: "Added to favorites" });
      }
    } catch {
      toast.error({ title: "Failed to update favorite" });
    }
  }, [activeNoteId, note, favoriteNote, unfavoriteNote, toast]);

  const handleExpand = useCallback(() => {
    if (!activeSlug) return;
    router.push(`/dashboard/notes/${activeSlug}`);
  }, [activeSlug, router]);

  if (!open) return null;

  const isArchived = note?.isArchived ?? false;
  const isFavorite = note?.isFavorite ?? false;
  const lastEditedAt = note?.updatedAt ?? draftNote?.createdAt;

  const actions = (
    <div className="flex items-center gap-0.5">
      <span
        className={`text-[11px] select-none transition-colors duration-300 mr-1.5 ${saveStatusColor[saveStatus]}`}
      >
        {saveStatusShortLabel[saveStatus]}
      </span>

      {activeNoteId && !isArchived && (
        <Tooltip
          content={isFavorite ? "Remove from favorites" : "Add to favorites"}
          side="bottom"
        >
          <button
            type="button"
            onClick={handleMarkAsFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className={`w-11 h-11 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${focusRingZinc} ${
              isFavorite
                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Star size={13} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </Tooltip>
      )}

      {activeNoteId && isArchived && (
        <Tooltip content="Restore note" side="bottom">
          <button
            type="button"
            onClick={handleRestoreNote}
            aria-label="Restore note"
            className="w-11 h-11 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer ${focusRingZinc}"
          >
            <RotateCcw size={13} />
          </button>
        </Tooltip>
      )}

      {activeNoteId && !isArchived && (
        <Tooltip content="Archive note" side="bottom">
          <button
            type="button"
            onClick={handleArchiveNote}
            aria-label="Archive note"
            className="w-11 h-11 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer ${focusRingZinc}"
          >
            <Archive size={13} />
          </button>
        </Tooltip>
      )}

      {activeNoteId && (
        <Tooltip content="Delete note" side="bottom">
          <button
            type="button"
            onClick={handleDeleteNote}
            aria-label="Delete note"
            className="w-11 h-11 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${focusRingZinc}"
          >
            <Trash2 size={13} />
          </button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Drawer
        open={open}
        onClose={onClose}
        onExpand={activeSlug ? handleExpand : undefined}
        actions={actions}
        size="2xl"
      >
        <div
          className="flex flex-col h-full cursor-text bg-zinc-950"
          onClick={() => editorRef.current?.focus()}
        >
          <div
            className="px-8 pt-10 pb-4 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={titleRef}
              value={titleDraft}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              rows={1}
              className="w-full resize-none overflow-hidden outline-none bg-transparent text-3xl font-semibold text-white tracking-tight leading-[1.2] placeholder:text-zinc-800 cursor-text"
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <FolderPicker
                noteId={activeNoteId}
                currentFolderId={note?.folderId ?? null}
              />
              <TagPicker noteId={activeNoteId} />

              {lastEditedAt && (
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <Clock size={10} className="shrink-0" />
                  <span>Edited {timeAgo(new Date(lastEditedAt))}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mx-8 border-t border-zinc-900 shrink-0" />

          <div
            className="flex-1 min-h-0 overflow-y-auto px-8 pt-6 pb-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <EditorPluginsBundle
                contentEditable={
                  <ContentEditable
                    aria-placeholder="Start writing..."
                    className="outline-none min-h-[60vh] text-[15px] leading-[1.75] text-zinc-200"
                    placeholder={
                      <div className="absolute top-0 left-0 text-zinc-700 text-[15px] pointer-events-none select-none">
                        Start writing, or type # for headings, - for lists...
                      </div>
                    }
                  />
                }
                editorRef={editorRef}
                restoreContent={note?.content || undefined}
                onChange={(editorState) => {
                  const json = JSON.stringify(editorState.toJSON());
                  if (json === contentJson) return;
                  const preview = editorState.read(() =>
                    $getRoot().getTextContent().slice(0, PREVIEW_CHAR_LIMIT),
                  );
                  previewRef.current = preview;
                  setContentJson(json);
                  scheduleAutoSave(titleDraft, json, preview);
                }}
              />
            </div>
          </div>
        </div>
      </Drawer>
    </LexicalComposer>
  );
}
