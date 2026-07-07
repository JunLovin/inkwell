"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ArrowLeft, Star, Archive, Trash2, Clock } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";

import { Tooltip, Loader } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { createEditorConfig, EditorPluginsBundle } from "@/lib/lexical";
import { TagPicker } from "@/modules/tags";
import { FolderPicker } from "@/modules/folders";
import { useNote } from "../../infrastructure/hooks/use-note";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import { useAutoSaveNote } from "../../infrastructure/hooks/use-autosave-note";
import { InsertAIContentPlugin } from "../components/note-editor/InsertAIContentPlugin";
import {
  PREVIEW_CHAR_LIMIT,
  saveStatusColor,
  saveStatusLongLabel,
  type SaveStatus,
} from "../../domain/services/editor-constants";

import { timeAgo } from "../../domain/services/time-ago";

type Props = { slug: string };

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  return (
    <span
      className={`text-xs select-none transition-colors duration-300 ${saveStatusColor[status]}`}
    >
      {saveStatusLongLabel[status]}
    </span>
  );
}

export function NoteDetailPage({ slug }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { note, isLoading } = useNote(slug);
  const { updateNote, archiveNote, deleteNote, favoriteNote, unfavoriteNote } =
    useNoteActions();

  const { scheduleAutoSave, saveStatus } = useAutoSaveNote({
    noteId: note?._id,
    updateNote,
  });

  const [titleDraft, setTitleDraft] = useState("");
  const [contentJson, setContentJson] = useState("");
  const [syncedNoteId, setSyncedNoteId] = useState<string | null>(null);

  const previewRef = useRef<string>("");
  const editorRef = useRef<LexicalEditor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  if (note && note._id !== syncedNoteId) {
    setSyncedNoteId(note._id);
    setTitleDraft(note.title || "");
    setContentJson(note.content ?? "");
  }

  useEffect(() => {
    if (!note) return;
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [note]);

  useEffect(() => {
    if (isLoading || animated.current) return;
    animated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45 },
      )
        .fromTo(
          contentAreaRef.current,
          { opacity: 0, y: 24, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 },
          "-=0.25",
        )
        .fromTo(
          gsap.utils.toArray(actionButtonsRef.current?.children ?? []),
          { opacity: 0, x: 8 },
          { opacity: 1, x: 0, duration: 0.35, stagger: 0.06 },
          "-=0.3",
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  const editorConfig = useMemo(
    () => createEditorConfig("inkwell-note-detail"),
    [],
  );

  if (isLoading || !note) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitleDraft(val);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    scheduleAutoSave(val, contentJson, previewRef.current);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.focus();
    }
  };

  const handleFavorite = async () => {
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
  };

  const handleArchive = async () => {
    try {
      await archiveNote(note._id);
      toast.success({ title: "Note archived" });
      router.push("/dashboard/notes");
    } catch {
      toast.error({ title: "Failed to archive note" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(note._id);
      toast.success({ title: "Note deleted" });
      router.push("/dashboard/notes");
    } catch {
      toast.error({ title: "Failed to delete note" });
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col overflow-hidden">
      <header
        ref={headerRef}
        className="flex items-center justify-between px-5 h-14 border-b border-zinc-800/60 shrink-0 bg-zinc-950/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip content="Back" side="bottom">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
          </Tooltip>
          <span className="text-zinc-700 text-xs shrink-0">/</span>
          <span className="text-zinc-400 text-xs truncate">
            {note.title || "Untitled"}
          </span>
        </div>

        <SaveStatusIndicator status={saveStatus} />

        <div ref={actionButtonsRef} className="flex items-center gap-0.5">
          <Tooltip
            content={
              note.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            side="bottom"
          >
            <button
              type="button"
              onClick={handleFavorite}
              className={`w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl transition-colors ${
                note.isFavorite
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Star
                size={15}
                fill={note.isFavorite ? "currentColor" : "none"}
              />
            </button>
          </Tooltip>
          <Tooltip content="Archive note" side="bottom">
            <button
              type="button"
              onClick={handleArchive}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Archive size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Delete note" side="bottom">
            <button
              type="button"
              onClick={handleDelete}
              className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
        </div>
      </header>

      <LexicalComposer initialConfig={editorConfig}>
        <div
          className="flex-1 overflow-y-auto cursor-text"
          onClick={() => editorRef.current?.focus()}
        >
          <div
            ref={contentAreaRef}
            className="max-w-[720px] mx-auto px-4 sm:px-8 pt-14 pb-40"
          >
            <textarea
              ref={titleRef}
              value={titleDraft}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              rows={1}
              className="w-full resize-none overflow-hidden outline-none bg-transparent text-5xl font-bold text-white tracking-tight leading-tight placeholder:text-zinc-700 mb-4"
            />

            {note.updatedAt && (
              <div className="flex items-center gap-1.5 mb-4">
                <Clock size={11} className="text-zinc-400 shrink-0" />
                <span className="text-xs text-zinc-400">
                  Last edited {timeAgo(new Date(note.updatedAt))}
                </span>
              </div>
            )}

            <div className="mb-10 flex flex-wrap items-center gap-3">
              <FolderPicker
                noteId={note._id}
                currentFolderId={note.folderId ?? null}
              />
              <TagPicker noteId={note._id} />
            </div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <EditorPluginsBundle
                contentEditable={
                  <ContentEditable
                    aria-placeholder="Start writing..."
                    className="outline-none min-h-[60vh]"
                    placeholder={
                      <div className="absolute top-0 left-0 text-zinc-700 text-sm pointer-events-none select-none">
                        Start writing... use # for headings, - for lists,{" "}
                        {"```"} for code blocks
                      </div>
                    }
                  />
                }
                editorRef={editorRef}
                restoreContent={note.content || undefined}
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
              <InsertAIContentPlugin noteId={note._id} />
            </div>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
