export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
};

export type AttachedNote = {
  id: string;
  title: string;
  slug: string;
  plainText: string;
};

export type AttachedFile = {
  id: string;
  name: string;
  mimeType: string;
  data: string;
};
