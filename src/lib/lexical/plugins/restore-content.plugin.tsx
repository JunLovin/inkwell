"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type Props = {
  content: string;
  onRestoreError?: (err: unknown) => void;
};

export function RestoreContentPlugin({ content, onRestoreError }: Props) {
  const [editor] = useLexicalComposerContext();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current || !content) return;
    try {
      const state = editor.parseEditorState(content);
      editor.setEditorState(state);
      restored.current = true;
    } catch (err) {
      console.warn("[lexical] failed to restore editor content", err);
      onRestoreError?.(err);
    }
  }, [editor, content, onRestoreError]);

  return null;
}
