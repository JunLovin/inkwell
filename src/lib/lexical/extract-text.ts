import { createHeadlessEditor } from "@lexical/headless";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $getRoot } from "lexical";

export function extractTextFromLexicalJSON(json: string): string {
  try {
    const editor = createHeadlessEditor({
      nodes: [
        HeadingNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        ListNode,
        ListItemNode,
        HorizontalRuleNode,
      ],
    });
    const state = editor.parseEditorState(json);
    return state.read(() => $getRoot().getTextContent());
  } catch {
    return "";
  }
}
