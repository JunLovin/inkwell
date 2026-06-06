"use client";

import { useEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import { Loader } from "@/shared/ui";
import { createEditorConfig } from "@/lib/lexical";
import { useNote } from "../../infrastructure/hooks/use-note";
import { useNoteActions } from "../../infrastructure/hooks/use-note-actions";
import type { SaveStatus } from "../components/note-editor";

type Props = {
  slug: string;
};

export function NoteDetailPage({ slug }: Props) {
  const { note, isLoading } = useNote(slug);
  const { updateNote } = useNoteActions();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [titleDraft, setTitleDraft] = useState("Untitled");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (note) {
      setTitleDraft(note.title);
    }
  }, [note]);

  if (isLoading || !note) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader variant="circle" size="lg" />
      </div>
    );
  }

  const editorConfig = createEditorConfig(
    "inkwell-note-viewer",
    note.content || undefined,
  );

  const handleUpdateNote = async (json: string) => {
    if (!titleDraft.trim()) return;
    try {
      setSaveStatus("saving");
      await updateNote({ id: note._id, title: titleDraft, content: json });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="w-full relative h-dvh overflow-y-auto p-4">
        <span className="fixed text-zinc-500 select-none right-4 top-8">
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
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              handleUpdateNote(json);
            }, 3000);
          }}
        />
      </div>
    </LexicalComposer>
  );
}
