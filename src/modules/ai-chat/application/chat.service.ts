import type {
  ChatRepositoryPort,
  GeminiMessage,
  GeminiPart,
} from "../domain/repositories/chat.repository";
import type {
  AttachedFile,
  AttachedNote,
  ChatMessage,
} from "../domain/entities/chat-message";
import type { ChatMode } from "../domain/services/system-prompt.builder";

function toGeminiHistory(messages: ChatMessage[]): GeminiMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }));
}

function buildUserParts(text: string, files: AttachedFile[]): GeminiPart[] {
  const parts: GeminiPart[] = [{ text }];
  for (const file of files) {
    parts.push({
      inlineData: { mimeType: file.mimeType, data: file.data },
    });
  }
  return parts;
}

export function createChatService(repo: ChatRepositoryPort) {
  return {
    useSendMessage: () => {
      const send = repo.useSendMessage();
      return async (params: {
        history: ChatMessage[];
        text: string;
        attachedFiles: AttachedFile[];
        attachedNote: AttachedNote | null;
        mode?: ChatMode;
      }) => {
        const allMessages: GeminiMessage[] = [
          ...toGeminiHistory(params.history),
          {
            role: "user",
            parts: buildUserParts(params.text, params.attachedFiles),
          },
        ];
        return send({
          messages: allMessages,
          mode: params.mode ?? "chat",
          attachedNote: params.attachedNote
            ? {
                title: params.attachedNote.title,
                plainText: params.attachedNote.plainText,
              }
            : undefined,
        });
      };
    },
  };
}
