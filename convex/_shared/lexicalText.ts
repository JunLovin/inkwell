type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

function walk(node: LexicalNode | undefined, parts: string[]): void {
  if (!node) return;
  if (typeof node.text === "string" && node.text.length > 0) {
    parts.push(node.text);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, parts);
  }
}

export function extractTextFromLexicalJSON(json: string | undefined): string {
  if (!json) return "";
  try {
    const parsed = JSON.parse(json) as { root?: LexicalNode };
    const parts: string[] = [];
    walk(parsed.root, parts);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

export function buildSearchableContent(
  title: string,
  contentJson: string | undefined,
): string {
  const body = extractTextFromLexicalJSON(contentJson);
  return body ? `${title} ${body}` : title;
}
