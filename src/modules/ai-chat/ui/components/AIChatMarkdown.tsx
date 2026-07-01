import {
  parseInlineSpans,
  tokenizeMarkdown,
  type InlineSpan,
} from "../../domain/services/markdown-parser";

type Props = {
  content: string;
};

function renderInline(text: string): React.ReactNode[] {
  return parseInlineSpans(text).map((span, i) => renderSpan(span, i));
}

function renderSpan(span: InlineSpan, key: number): React.ReactNode {
  switch (span.type) {
    case "code":
      return (
        <code
          key={key}
          className="bg-zinc-800 text-emerald-400 rounded px-1 py-0.5 text-xs font-mono"
        >
          {span.value}
        </code>
      );
    case "strong":
      return (
        <strong key={key} className="font-semibold text-white">
          {span.value}
        </strong>
      );
    case "em":
      return (
        <em key={key} className="italic text-zinc-300">
          {span.value}
        </em>
      );
    default:
      return span.value;
  }
}

const headingClasses: Record<1 | 2 | 3, string> = {
  1: "text-base font-bold text-white",
  2: "text-sm font-bold text-white",
  3: "text-sm font-semibold text-zinc-100",
};

export function AIChatMarkdown({ content }: Props) {
  const tokens = tokenizeMarkdown(content);

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
          const HeadingTag = `h${token.level}` as "h1" | "h2" | "h3";
          return (
            <HeadingTag key={idx} className={headingClasses[token.level]}>
              {renderInline(token.text)}
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
                  {renderInline(item)}
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
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={idx} className="text-zinc-300">
            {renderInline(token.text)}
          </p>
        );
      })}
    </div>
  );
}
