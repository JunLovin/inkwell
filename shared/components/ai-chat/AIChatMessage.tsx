import type { ChatMessage } from "@/lib/types/ai-chat.types";
import { AIChatMarkdown } from "./AIChatMarkdown";

type Props = {
  message: ChatMessage;
};

export function AIChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-zinc-700/60 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-zinc-100 leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] bg-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-2.5">
        <AIChatMarkdown content={message.content} />
      </div>
    </div>
  );
}
