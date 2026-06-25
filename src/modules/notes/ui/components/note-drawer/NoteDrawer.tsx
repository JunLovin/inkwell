"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Archive, Trash2, RotateCcw, Clock } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";

import { Drawer } from "@/shared/ui/drawer";
import { Tooltip } from "@/shared/ui/tooltip";
import { useToast } from "@/shared/hooks/use-toast";
import {
  createEditorConfig,
  RestoreContentPlugin,
  FloatingFormatToolbarPlugin,
} from "@/lib/lexical";
import { useNoteActions } from "../../../infrastructure/hooks/use-note-actions";
import type { Note } from "../../../domain/entities/note";
import type { SaveStatus } from "../note-editor";

type NoteDrawerProps = {
  note: Note | null;
  open: boolean;
  onClose: () => void;
};

const saveStatusColor: Record<SaveStatus, string> = {
  idle: "text-transparent",
  saving: "text-zinc-600",
  saved: "text-zinc-500",
};

const saveStatusLabel: Record<SaveStatus, string> = {
  idle: "saved",
  saving: "Saving...",
  saved: "Saved",
};

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NoteDrawer({ note, open, onClose }: NoteDrawerProps) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    updateNote,
    archiveNote,
    restoreNote,
    deleteNote,
    favoriteNote,
    unfavoriteNote,
  } = useNoteActions();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [titleDraft, setTitleDraft] = useState("");
  const [contentJson, setContentJson] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<string>("");
  const editorRef = useRef<LexicalEditor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!note) return;
    setTitleDraft(note.title || "");
    setContentJson(note.content ?? "");
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [note?._id]);

  const editorConfig = useMemo(
    () => createEditorConfig("inkwell-note-drawer"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note?._id],
  );

  const scheduleAutoSave = useCallback(
    (title: string, json: string) => {
      if (!note) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setSaveStatus("saving");
      timerRef.current = setTimeout(async () => {
        try {
          await updateNote({
            id: note._id,
            title: title.trim() || "Untitled",
            content: json,
            preview: previewRef.current,
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
          toast.error({ title: "Failed to save note" });
        }
      }, 2000);
    },
    [note, updateNote, toast],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setTitleDraft(val);
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
      scheduleAutoSave(val, contentJson);
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
    if (!note) return;
    try {
      await deleteNote(note._id);
      onClose();
      toast.success({ title: "Note deleted" });
    } catch {
      toast.error({ title: "Failed to delete note" });
    }
  }, [note, deleteNote, onClose, toast]);

  const handleArchiveNote = useCallback(async () => {
    if (!note) return;
    try {
      await archiveNote(note._id);
      onClose();
      toast.success({ title: "Note archived" });
    } catch {
      toast.error({ title: "Failed to archive note" });
    }
  }, [note, archiveNote, onClose, toast]);

  const handleRestoreNote = useCallback(async () => {
    if (!note) return;
    try {
      await restoreNote(note._id);
      onClose();
      toast.success({ title: "Note restored" });
    } catch {
      toast.error({ title: "Failed to restore note" });
    }
  }, [note, restoreNote, onClose, toast]);

  const handleMarkAsFavorite = useCallback(async () => {
    if (!note) return;
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
  }, [note, favoriteNote, unfavoriteNote, toast]);

  if (!note) return null;

  const actions = (
    <div className="flex items-center gap-0.5">
      <span
        className={`text-[11px] select-none transition-colors duration-300 mr-1.5 ${saveStatusColor[saveStatus]}`}
      >
        {saveStatusLabel[saveStatus]}
      </span>

      {!note.isArchived && (
        <Tooltip
          content={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
          side="bottom"
        >
          <button
            type="button"
            onClick={handleMarkAsFavorite}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              note.isFavorite
                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Star size={13} fill={note.isFavorite ? "currentColor" : "none"} />
          </button>
        </Tooltip>
      )}

      {note.isArchived ? (
        <Tooltip content="Restore note" side="bottom">
          <button
            type="button"
            onClick={handleRestoreNote}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Archive note" side="bottom">
          <button
            type="button"
            onClick={handleArchiveNote}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Archive size={13} />
          </button>
        </Tooltip>
      )}

      <Tooltip content="Delete note" side="bottom">
        <button
          type="button"
          onClick={handleDeleteNote}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </Tooltip>
    </div>
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Drawer
        open={open}
        onClose={onClose}
        onExpand={() => router.push(`/dashboard/notes/${note.slug}`)}
        actions={actions}
        size="xl"
      >
        <div
          className="flex flex-col h-full cursor-text"
          onClick={() => editorRef.current?.focus()}
        >
          <div
            className="px-6 pt-8 pb-5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={titleRef}
              value={titleDraft}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              rows={1}
              className="w-full resize-none overflow-hidden outline-none bg-transparent text-2xl font-semibold text-white tracking-tight leading-snug placeholder:text-zinc-700 cursor-text"
            />

            {note.updatedAt && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <Clock size={10} className="text-zinc-700 shrink-0" />
                <span className="text-[11px] text-zinc-700">
                  Last edited {timeAgo(note.updatedAt)}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800/50 mx-6 shrink-0" />

          <div
            className="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    aria-placeholder="Start writing..."
                    className="outline-none min-h-[50vh] text-[14px] leading-relaxed text-zinc-200"
                    placeholder={
                      <div className="absolute top-0 left-0 text-zinc-700 text-sm pointer-events-none select-none">
                        Start writing...
                      </div>
                    }
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>

            <HistoryPlugin />
            <ListPlugin />
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <EditorRefPlugin editorRef={editorRef} />
            <FloatingFormatToolbarPlugin />
            {note.content && <RestoreContentPlugin content={note.content} />}
            <OnChangePlugin
              onChange={(editorState) => {
                const json = JSON.stringify(editorState.toJSON());
                if (json === contentJson) return;
                previewRef.current = editorState.read(() =>
                  $getRoot().getTextContent().slice(0, 150),
                );
                setContentJson(json);
                scheduleAutoSave(titleDraft, json);
              }}
            />
          </div>
        </div>
      </Drawer>
    </LexicalComposer>
  );
}
