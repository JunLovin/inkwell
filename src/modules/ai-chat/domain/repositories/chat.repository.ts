import type { ChatMode } from "../services/system-prompt.builder";

export type GeminiPart =
  { text: string } | { inlineData: { mimeType: string; data: string } };

export type GeminiMessage = {
  role: "user" | "model";
  parts: GeminiPart[];
};

export type NoteContextPayload = {
  title: string;
  plainText: string;
};

export type SendMessagePayload = {
  messages: GeminiMessage[];
  mode?: ChatMode;
  attachedNote?: NoteContextPayload;
};

export type ChatRepositoryPort = {
  useSendMessage: () => (payload: SendMessagePayload) => Promise<string>;
};
