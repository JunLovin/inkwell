import type { AttachedNote } from "../entities/chat-message";

export const dashboardSuggestions: ReadonlyArray<string> = [
  "Summarize my recent notes",
  "What did I write about last week?",
  "Help me organize my ideas",
];

export const noteSuggestions: ReadonlyArray<string> = [
  "Summarize this note",
  "Suggest improvements",
  "Extract action items",
];

export function getSuggestions(
  attachedNote: AttachedNote | null,
): ReadonlyArray<string> {
  return attachedNote ? noteSuggestions : dashboardSuggestions;
}
