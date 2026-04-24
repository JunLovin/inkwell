"use client";

import { useRouter } from "next/navigation";
import { Calendar, MoreHorizontal } from "lucide-react";

import { Drawer } from "@/shared/components/ui/drawer";
import { Dropdown } from "@/shared/components/ui";
import { Note } from "./NoteCard";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/lib/hooks/useToast";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { editorTheme } from "./NoteEditor";

import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ParagraphNode } from "lexical";

type NoteDrawerProps = {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onArchive?: (id: string) => void;
};

export function NoteDrawer({
  note,
  open,
  onClose,
  onArchive,
}: NoteDrawerProps) {
  const { toast } = useToast();
  const router = useRouter();

  const deleteNote = useMutation(api.notes.deleteNote);

  if (!note) return null;

  const menuItems = [
    {
      id: "archive",
      label: "Archive note",
      onClick: () => {
        onArchive?.(note._id);
        onClose();
      },
    },
    {
      id: "sep",
      label: "",
      separator: true,
      onClick: () => {},
    },
    {
      id: "delete",
      label: "Delete note",
      variant: "danger" as const,
      onClick: () => {
        handleDeleteNote();
      },
    },
  ];

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

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Drawer
        open={open}
        onClose={onClose}
        title={note.title || "Untitled"}
        onExpand={() => router.push(`/dashboard/notes/${note.slug}`)}
      >
        <div className="flex flex-col h-full">
          <div
            className={`h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-end p-5 relative`}
          >
            <div className="absolute top-4 right-4">
              <Dropdown
                trigger={
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                }
                items={menuItems.map((i) => ({
                  id: i.id,
                  label: i.label,
                  separator: i.separator,
                  variant: i.variant,
                }))}
                onSelect={(id) => {
                  const item = menuItems.find((m) => m.id === id);
                  item?.onClick();
                }}
                align="right"
                width={180}
              />
            </div>
          </div>

          <div className="px-5 py-4 border-b border-zinc-800 space-y-3">
            <h2 className="text-white text-lg font-medium tracking-tight">
              {note.title || "Untitled"}
            </h2>

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
          </div>
        </div>
      </Drawer>
    </LexicalComposer>
  );
}
