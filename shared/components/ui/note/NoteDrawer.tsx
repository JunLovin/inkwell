"use client";

import { useRouter } from "next/navigation";
import { Calendar, Star, Archive, Trash2, RotateCcw } from "lucide-react";

import { Drawer } from "@/shared/components/ui/drawer";
import { Tooltip } from "@/shared/components/ui/tooltip";
import { Note } from "./NoteCard";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/lib/hooks/useToast";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { editorTheme, SaveStatus } from "./NoteEditor";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ParagraphNode } from "lexical";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { useEffect, useRef, useState } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

type NoteDrawerProps = {
  note: Note | null;
  open: boolean;
  onClose: () => void;
};

export function NoteDrawer({ note, open, onClose }: NoteDrawerProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const updateNote = useMutation(api.notes.updateNote);
  const archiveNote = useMutation(api.notes.archiveNote);
  const restoreNote = useMutation(api.notes.restoreNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const markNoteAsFavorite = useMutation(api.notes.markNoteAsFavorite);
  const removeFavoriteNote = useMutation(api.notes.removeFavoriteNote);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!note) return null;

  const handleDeleteNote = async () => {
    try {
      if (!note) return;
      await deleteNote({ id: note._id });
      onClose();
      toast.success({
        title: "Note deleted successfully",
        description: "The note has been deleted.",
      });
    } catch (error) {
      console.error("Something went wrong deleting note:", error);
      toast.error({
        title: "Failed to delete note",
        description: "Something went wrong. Try again later.",
      });
    }
  };

  const handleArchiveNote = async () => {
    try {
      if (!note) return;
      await archiveNote({ id: note._id });
      onClose();
      toast.success({
        title: "Note archived successfull",
        description: "The note has been archived.",
      });
    } catch (error) {
      console.error("Failed to archive note:", error);
      toast.error({
        title: "Failed to archive note",
        description: "Something went wrong. Try again later.",
      });
    }
  };

  const handleRestoreNote = async () => {
    try {
      if (!note) return;
      await restoreNote({ id: note._id });
      onClose();
      toast.success({
        title: "Note restored",
        description: "The note is back in your notes.",
      });
    } catch (error) {
      console.error("Failed to restore note:", error);
      toast.error({
        title: "Failed to restore note",
        description: "Something went wrong. Try again later.",
      });
    }
  };

  const editorConfig: InitialConfigType = {
    namespace: "inkwell-note-editor",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
    editorState: note.content,
    nodes: [
      ParagraphNode,
      HorizontalRuleNode,
      CodeNode,
      HeadingNode,
      LinkNode,
      ListNode,
      ListItemNode,
      QuoteNode,
    ],
  };

  const handleUpdateNote = async (json: string) => {
    try {
      setSaveStatus("saving");

      await updateNote({
        id: note._id,
        title: note.title,
        content: json,
      });

      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error({
        title: "Failed to update note",
        description: "Something went wrong, please try again later.",
      });
    } finally {
      setSaveStatus("idle");
    }
  };

  const handleMarkAsFavorite = async () => {
    try {
      if (note.isFavorite) {
        await removeFavoriteNote({ id: note._id });
        toast.success({
          title: "Removed from favorites",
          description: "The note has been removed from your favorites.",
        });
      } else {
        await markNoteAsFavorite({ id: note._id });
        toast.success({
          title: "Added to favorites",
          description: "The note has been added to your favorites.",
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to update favorite:", error);
      toast.error({
        title: "Failed to update favorite",
        description: "Something went wrong, please try again later.",
      });
    }
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Drawer
        open={open}
        onClose={onClose}
        title={note.title ?? "Untitled"}
        onExpand={() => router.push(`/dashboard/notes/${note.slug}`)}
      >
        <div className="flex flex-col h-full">
          <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 relative">
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {!note.isArchived && (
                <Tooltip content={note.isFavorite ? "Remove from favorites" : "Add to favorites"} side="bottom">
                  <button
                    type="button"
                    onClick={handleMarkAsFavorite}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      note.isFavorite
                        ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : "text-zinc-500 bg-zinc-800/80 border border-zinc-700 hover:text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    <Star size={14} fill={note.isFavorite ? "currentColor" : "none"} />
                  </button>
                </Tooltip>
              )}
              {note.isArchived ? (
                <Tooltip content="Restore note" side="bottom">
                  <button
                    type="button"
                    onClick={handleRestoreNote}
                    className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip content="Archive note" side="bottom">
                  <button
                    type="button"
                    onClick={handleArchiveNote}
                    className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <Archive size={14} />
                  </button>
                </Tooltip>
              )}
              <Tooltip content="Delete note" side="bottom">
                <button
                  type="button"
                  onClick={handleDeleteNote}
                  className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-white text-lg font-medium tracking-tight">
                {note.title || "Untitled"}
              </h2>
              <span className="text-zinc-600 font-semibold text-sm select-none">
                {saveStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {note.updatedAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <Calendar size={11} />
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 px-5 py-4 overflow-y-auto">
            <RichTextPlugin
              contentEditable={<ContentEditable className="viewer-input" />}
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin
              onChange={(editorState) => {
                const json = JSON.stringify(editorState.toJSON());

                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                }

                timerRef.current = setTimeout(() => {
                  handleUpdateNote(json);
                }, 3000);
              }}
            />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </Drawer>
    </LexicalComposer>
  );
}
