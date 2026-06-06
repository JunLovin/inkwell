import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { ParagraphNode } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

export const editorTheme = {
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

export const editorNodes = [
  ParagraphNode,
  HorizontalRuleNode,
  CodeNode,
  HeadingNode,
  LinkNode,
  ListNode,
  ListItemNode,
  QuoteNode,
];

export function createEditorConfig(
  namespace: string,
  editorState?: string,
): InitialConfigType {
  return {
    namespace,
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
    nodes: editorNodes,
    ...(editorState ? { editorState } : {}),
  };
}
