"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function RestoreContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current || !content) return;
    try {
      const state = editor.parseEditorState(content);
      editor.setEditorState(state);
      restored.current = true;
    } catch {
      // not valid JSON - leave editor empty
    }
  }, [editor, content]);

  return null;
}
