import type { AttachedNote } from "../entities/chat-message";

const BASE_PROMPT =
  "You are Inkwell Assistant, an AI helper for the Inkwell note-taking app.";

const FREE_PROMPT = `${BASE_PROMPT} Help the user with their notes, writing, and any questions they have.`;

export function buildSystemPrompt(attachedNote: AttachedNote | null): string {
  if (!attachedNote) return FREE_PROMPT;
  return `${BASE_PROMPT} The user has shared a note with you. Here is its full content:\n\n---\n${attachedNote.plainText}\n---\n\nHelp the user with questions, summaries, or any tasks related to this note or their writing.`;
}
