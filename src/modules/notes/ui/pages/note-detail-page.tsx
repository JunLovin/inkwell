"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ArrowLeft, Star, Archive, Trash2, Clock } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";

import { Tooltip, Loader } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import {
  createEditorConfig,
  RestoreContentPlugin,
  FloatingFormatToolbarPlugin,
} from "@/lib/lexical";
import { useNote } from "../../infrastructure/hooks/use-note";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { SaveStatus } from "../components/note-editor";

type Props = { slug: string };

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const saveStatusText: Record<SaveStatus, string> = {
  idle: "All changes saved",
  saving: "Saving...",
  saved: "Saved",
};

const saveStatusColor: Record<SaveStatus, string> = {
  idle: "text-transparent",
  saving: "text-zinc-600",
  saved: "text-zinc-500",
};

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  return (
    <span
      className={`text-xs select-none transition-colors duration-300 ${saveStatusColor[status]}`}
    >
      {saveStatusText[status]}
    </span>
  );
}

export function NoteDetailPage({ slug }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { note, isLoading } = useNote(slug);
  const { updateNote, archiveNote, deleteNote, favoriteNote, unfavoriteNote } =
    useNoteActions();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [titleDraft, setTitleDraft] = useState("");
  const [contentJson, setContentJson] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<string>("");
  const editorRef = useRef<LexicalEditor | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

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

  const editorConfig = useMemo(
    () => createEditorConfig("inkwell-note-detail"),
    [note?._id],
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
    scheduleAutoSave(val, contentJson);
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
              className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
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
          <Tooltip content={note.isFavorite ? "Remove from favorites" : "Add to favorites"} side="bottom">
            <button
              type="button"
              onClick={handleFavorite}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                note.isFavorite
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Star size={15} fill={note.isFavorite ? "currentColor" : "none"} />
            </button>
          </Tooltip>
          <Tooltip content="Archive note" side="bottom">
            <button
              type="button"
              onClick={handleArchive}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Archive size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Delete note" side="bottom">
            <button
              type="button"
              onClick={handleDelete}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
            className="max-w-[720px] mx-auto px-8 pt-14 pb-40"
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
              <div className="flex items-center gap-1.5 mb-10">
                <Clock size={11} className="text-zinc-700 shrink-0" />
                <span className="text-xs text-zinc-700">
                  Last edited {timeAgo(new Date(note.updatedAt))}
                </span>
              </div>
            )}

            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <RichTextPlugin
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
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>

            <HistoryPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <TabIndentationPlugin />
            <LinkPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
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
      </LexicalComposer>
    </div>
  );
}
