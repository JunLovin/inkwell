"use client";

import type { ReactElement, Ref } from "react";
import type { EditorState, LexicalEditor } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import { FloatingFormatToolbarPlugin } from "../plugins/floating-format-toolbar.plugin";
import { RestoreContentPlugin } from "../plugins/restore-content.plugin";

type EditorPluginsBundleProps = {
  contentEditable: ReactElement;
  onChange?: (editorState: EditorState) => void;
  editorRef?: Ref<LexicalEditor>;
  restoreContent?: string;
};

export function EditorPluginsBundle({
  contentEditable,
  onChange,
  editorRef,
  restoreContent,
}: EditorPluginsBundleProps) {
  return (
    <>
      <RichTextPlugin
        contentEditable={contentEditable}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <TabIndentationPlugin />
      <LinkPlugin />
      <ClickableLinkPlugin />
      <HorizontalRulePlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <FloatingFormatToolbarPlugin />
      {editorRef && <EditorRefPlugin editorRef={editorRef} />}
      {restoreContent && <RestoreContentPlugin content={restoreContent} />}
      {onChange && <OnChangePlugin onChange={onChange} />}
    </>
  );
}
