"use client";

import { Copy, RotateCcw } from "lucide-react";

import { Tooltip } from "@/shared/ui/tooltip";
import { useToast } from "@/shared/hooks/use-toast";
import type { ChatMessage } from "../../domain/entities/chat-message";
import { AIChatMarkdown } from "./AIChatMarkdown";

type Props = {
  message: ChatMessage;
  isLast?: boolean;
  onRegenerate?: () => void;
};

export function AIChatMessage({ message, isLast, onRegenerate }: Props) {
  const { toast } = useToast();
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success({ title: "Copied to clipboard" });
    } catch {
      toast.error({ title: "Could not copy" });
    }
  };

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
    <div className="group flex flex-col items-start">
      <div className="max-w-[88%] bg-zinc-800/60 rounded-2xl rounded-tl-sm px-4 py-2.5">
        <AIChatMarkdown content={message.content} />
      </div>
      <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Tooltip content="Copy">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy message"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Copy className="w-3 h-3" />
          </button>
        </Tooltip>
        {isLast && onRegenerate && (
          <Tooltip content="Regenerate">
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Regenerate response"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
