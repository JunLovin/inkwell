"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

import type { NoteId } from "../../../domain/entities/note";
import { useAIChatStore } from "@/modules/ai-chat";
import { jsonToMarkdown } from "@/lib/lexical";

type Props = { noteId: NoteId };

export function InsertAIContentPlugin({ noteId }: Props) {
  const [editor] = useLexicalComposerContext();
  const pending = useAIChatStore((s) => s.pendingInsertion);
  const clear = useAIChatStore((s) => s.clearPendingInsertion);

  useEffect(() => {
    if (!pending || pending.noteId !== noteId) return;

    const token = pending.token;
    const markdown = pending.markdown;

    const currentJson = JSON.stringify(editor.getEditorState().toJSON());
    let existingMarkdown = "";
    try {
      existingMarkdown = jsonToMarkdown(currentJson).trim();
    } catch {
      existingMarkdown = "";
    }

    const combined = existingMarkdown
      ? `${existingMarkdown}\n\n${markdown}`
      : markdown;

    editor.update(() => {
      $convertFromMarkdownString(combined, TRANSFORMERS);
      const root = $getRoot();
      root.selectEnd();
    });

    clear(token);
  }, [pending, noteId, editor, clear]);

  return null;
}
