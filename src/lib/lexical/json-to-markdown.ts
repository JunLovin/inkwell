import { createHeadlessEditor } from "@lexical/headless";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";

export const jsonToMarkdown = (jsonContent: string) => {
  const editor = createHeadlessEditor({
    nodes: [
      HorizontalRuleNode,
      CodeNode,
      HeadingNode,
      LinkNode,
      ListNode,
      ListItemNode,
      QuoteNode,
    ],
    onError: (error) => console.error(error),
  });

  const editorState = editor.parseEditorState(jsonContent);

  let markdown = "";
  editorState.read(() => {
    markdown = $convertToMarkdownString(TRANSFORMERS);
  });

  return markdown;
};
