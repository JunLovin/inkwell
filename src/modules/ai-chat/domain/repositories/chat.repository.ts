export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type GeminiMessage = {
  role: "user" | "model";
  parts: GeminiPart[];
};

export type SendMessagePayload = {
  messages: GeminiMessage[];
  systemPrompt?: string;
};

export type ChatRepositoryPort = {
  useSendMessage: () => (payload: SendMessagePayload) => Promise<string>;
};
