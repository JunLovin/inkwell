"use client";

import { X } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { $getRoot, type EditorState } from "lexical";

import { Divider } from "@/shared/ui/divider";
import { createEditorConfig, EditorPluginsBundle } from "@/lib/lexical";
import { PREVIEW_CHAR_LIMIT } from "../../../domain/services/editor-constants";

type NoteEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string, preview: string) => void;
  onClose?: () => void;
};

const editorConfig = createEditorConfig("inkwell-note-editor");

export function NoteEditor({
  initialTitle,
  initialContent = "",
  onTitleChange,
  onContentChange,
  onClose,
}: NoteEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTitleChange?.(e.target.value);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const handleEditorChange = (editorState: EditorState) => {
    const json = JSON.stringify(editorState.toJSON());
    const preview = editorState.read(() =>
      $getRoot().getTextContent().slice(0, PREVIEW_CHAR_LIMIT),
    );
    onContentChange?.(json, preview);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 h-5" />
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

      <div className="px-8">
        <textarea
          value={initialTitle}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full z-10 !text-white min-h-auto outline-none resize-none overflow-y-hidden overflow-x-auto max-h-40 text-nowrap text-3xl font-semibold tracking-tight placeholder:text-zinc-500 leading-tight"
        />
      </div>

      <div className="px-8 pb-5 shrink-0">
        <Divider />
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="relative">
            <EditorPluginsBundle
              contentEditable={
                <ContentEditable
                  aria-placeholder="Enter some text"
                  className="outline-none min-h-50"
                  placeholder={
                    <div className="absolute top-0 left-0 text-zinc-700 text-sm pointer-events-none select-none">
                      Start writing... use # for headings, - for lists, ``` for
                      code
                    </div>
                  }
                />
              }
              restoreContent={initialContent || undefined}
              onChange={handleEditorChange}
            />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
