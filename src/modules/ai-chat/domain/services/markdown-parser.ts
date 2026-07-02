export type MarkdownToken =
  | { type: "code-block"; lang: string; code: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "paragraph"; text: string };

export type InlineSpan =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string };

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function parseInlineSpans(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_PATTERN);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      spans.push({ type: "text", value: text.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      spans.push({ type: "code", value: raw.slice(1, -1) });
    } else if (raw.startsWith("**")) {
      spans.push({ type: "strong", value: raw.slice(2, -2) });
    } else {
      spans.push({ type: "em", value: raw.slice(1, -1) });
    }
    last = match.index + raw.length;
  }
  if (last < text.length) {
    spans.push({ type: "text", value: text.slice(last) });
  }

  return spans;
}

export function tokenizeMarkdown(content: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({ type: "code-block", lang, code: codeLines.join("\n") });
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      tokens.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    if (line.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      tokens.push({ type: "ul", items });
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      tokens.push({ type: "ol", items });
      continue;
    }

    if (line.trim() !== "") {
      tokens.push({ type: "paragraph", text: line });
    }

    i++;
  }

  return tokens;
}
