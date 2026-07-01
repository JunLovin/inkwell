type Props = {
  content: string;
};

type Token =
  | { type: "code-block"; lang: string; code: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "paragraph"; text: string };

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="bg-zinc-800 text-emerald-400 rounded px-1 py-0.5 text-xs font-mono"
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (raw.startsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-zinc-300">
          {raw.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + raw.length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts;
}

function tokenize(content: string): Token[] {
  const tokens: Token[] = [];
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

export function AIChatMarkdown({ content }: Props) {
  const tokens = tokenize(content);

  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-200 leading-relaxed">
      {tokens.map((token, idx) => {
        if (token.type === "code-block") {
          return (
            <pre
              key={idx}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 overflow-x-auto text-xs font-mono text-zinc-300"
            >
              <code>{token.code}</code>
            </pre>
          );
        }

        if (token.type === "heading") {
          const sizeMap: Record<1 | 2 | 3, string> = {
            1: "text-base font-bold text-white",
            2: "text-sm font-bold text-white",
            3: "text-sm font-semibold text-zinc-100",
          };
          const HeadingTag = `h${token.level}` as "h1" | "h2" | "h3";
          return (
            <HeadingTag key={idx} className={sizeMap[token.level]}>
              {parseInline(token.text)}
            </HeadingTag>
          );
        }

        if (token.type === "ul") {
          return (
            <ul
              key={idx}
              className="list-disc list-inside flex flex-col gap-0.5 pl-1"
            >
              {token.items.map((item, j) => (
                <li key={j} className="text-zinc-300">
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (token.type === "ol") {
          return (
            <ol
              key={idx}
              className="list-decimal list-inside flex flex-col gap-0.5 pl-1"
            >
              {token.items.map((item, j) => (
                <li key={j} className="text-zinc-300">
                  {parseInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={idx} className="text-zinc-300">
            {parseInline(token.text)}
          </p>
        );
      })}
    </div>
  );
}
