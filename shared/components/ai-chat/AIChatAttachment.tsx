"use client";

import { FileText, X, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAIChatStore } from "@/lib/stores/ai-chat.store";

export function AIChatAttachment() {
  const router = useRouter();
  const { attachedNote, attachedFiles, setAttachedNote, removeAttachedFile } =
    useAIChatStore();

  const hasAttachments = attachedNote || attachedFiles.length > 0;
  if (!hasAttachments) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pt-2">
      {attachedNote && (
        <div className="flex items-center gap-1.5 bg-zinc-800/70 border border-zinc-700/60 rounded-xl px-2.5 py-1.5 max-w-full">
          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <button
            onClick={() =>
              router.push(`/dashboard/notes/${attachedNote.slug}`)
            }
            className="text-xs text-zinc-300 hover:text-white transition-colors truncate max-w-[160px]"
          >
            {attachedNote.title}
          </button>
          <button
            onClick={() => setAttachedNote(null)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {attachedFiles.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-1.5 bg-zinc-800/70 border border-zinc-700/60 rounded-xl px-2.5 py-1.5 max-w-full"
        >
          <Paperclip className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-300 truncate max-w-[160px]">
            {file.name}
          </span>
          <button
            onClick={() => removeAttachedFile(file.id)}
            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 ml-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
