"use client";

import { api } from "@/convex/_generated/api";
import { Loader } from "@/shared/components/ui";
import {
  editorTheme,
  SaveStatus,
} from "@/shared/components/ui/note/NoteEditor";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useMutation, useQuery } from "convex/react";

import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useEffect, useRef, useState } from "react";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ParagraphNode } from "lexical";

interface Props {
  slug: string;
}

export default function NotePage({ slug }: Props) {
  const note = useQuery(api.myFunctions.getNote, { slug });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [titleDraft, setTitleDraft] = useState(note?.title || "");

  const updateNote = useMutation(api.myFunctions.updateNote);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  const editorConfig: InitialConfigType = {
    namespace: "inkwell-note-viewer",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
    editorState: note.content || "",
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
    if (!titleDraft.trim()) return;
    try {
      setSaveStatus("saving");

      await updateNote({
        id: note._id,
        title: titleDraft,
        content: json,
      });

      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <div className="w-full relative h-dvh overflow-y-auto">
          <span className="fixed text-zinc-500 select-none right-4 top-4">
            {saveStatus}
          </span>
          <textarea
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Untitled"
            className="w-full z-10 !text-white min-h-auto outline-none resize-none overflow-y-hidden overflow-x-auto max-h-40 text-nowrap text-3xl font-semibold tracking-tight placeholder:text-zinc-500 leading-tight"
          />
          <RichTextPlugin
            contentEditable={<ContentEditable className="viewer" />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
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
        </div>
      </LexicalComposer>
    </>
  );
}
