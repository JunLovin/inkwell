"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { $getRoot } from "lexical";
import type { EditorState } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { Divider } from "@/shared/components/ui";

export type SaveStatus = "idle" | "saving" | "saved";

type NoteEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string, preview: string) => void;
  onClose?: () => void;
  saveStatus?: SaveStatus;
};

const editorTheme = {
  root: "outline-none text-zinc-300 text-sm leading-relaxed",
  paragraph: "mb-2",
  heading: {
    h1: "text-2xl font-semibold text-white mb-3 mt-4",
    h2: "text-xl font-semibold text-white mb-2 mt-4",
    h3: "text-lg font-medium text-zinc-200 mb-2 mt-3",
  },
  text: {
    bold: "font-semibold text-zinc-100",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through text-zinc-500",
    code: "font-mono text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-md",
  },
  quote: "border-l-2 border-zinc-700 pl-4 text-zinc-500 italic my-3",
  list: {
    ul: "list-disc list-inside space-y-1 my-2 ml-4",
    ol: "list-decimal list-inside space-y-1 my-2 ml-4",
    listitem: "text-zinc-400",
    nested: { listitem: "ml-6" },
  },
  code: "block font-mono text-xs bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 p-4 rounded-xl my-3 overflow-x-auto",
};

const editorConfig: InitialConfigType = {
  namespace: "inkwell-note-editor",
  theme: editorTheme,
  onError: (error: Error) => console.error(error),
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
  ],
};

function RestoreContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current || !content) return;
    try {
      const state = editor.parseEditorState(content);
      editor.setEditorState(state);
      restored.current = true;
    } catch {
      // not valid JSON — leave editor empty
    }
  }, [editor, content]);

  return null;
}

export function NoteEditor({
  initialTitle = "Untitled",
  initialContent = "",
  onTitleChange,
  onContentChange,
  onClose,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResizeTitle();
  }, [autoResizeTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    onTitleChange?.(e.target.value);
    autoResizeTitle();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleEditorChange = (editorState: EditorState) => {
    const json = editorState.read(() => $getRoot().getTextContent());
    const preview = editorState.read(() =>
      $getRoot().getTextContent().slice(0, 150),
    );
    onContentChange?.(json, preview);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 h-5"></div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-8 pb-3">
        <textarea
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          rows={1}
          className="w-full z-10 text-white text-3xl font-semibold tracking-tight placeholder:text-zinc-500 outline-none resize-none leading-tight overflow-hidden"
        />
      </div>

      <div className="px-8 pb-5 shrink-0">
        <Divider />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="outline-none min-h-[200px]" />
              }
              placeholder={
                <div className="absolute top-0 left-0 text-zinc-700 text-sm pointer-events-none select-none">
                  Start writing... use # for headings, - for lists, ``` for code
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <TabIndentationPlugin />
            <OnChangePlugin onChange={handleEditorChange} />
            {initialContent && (
              <RestoreContentPlugin content={initialContent} />
            )}
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
