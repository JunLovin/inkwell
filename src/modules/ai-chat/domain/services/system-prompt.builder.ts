import type { AttachedNote } from "../entities/chat-message";

export type ChatMode = "chat" | "writer";

const BASE_PROMPT =
  "You are Inkwell Assistant, an AI helper for the Inkwell note-taking app.";

const FREE_PROMPT = `${BASE_PROMPT} Help the user with their notes, writing, and any questions they have.`;

function chatWithNote(attachedNote: AttachedNote): string {
  return `${BASE_PROMPT} The user has shared a note with you. Here is its full content:\n\n---\n${attachedNote.plainText}\n---\n\nHelp the user with questions, summaries, or any tasks related to this note or their writing.`;
}

function writerWithNote(attachedNote: AttachedNote): string {
  return `${BASE_PROMPT} You are in WRITER mode. The user is asking you to write content that will be appended directly into their note "${attachedNote.title}".

Existing note content:
---
${attachedNote.plainText || "(empty)"}
---

Rules:
- Reply with ONLY the markdown content to insert. No preamble, no meta-commentary, no wrapping code fences.
- Use standard markdown: # for headings, - for bullets, ** for bold, [text](url) for links.
- Continue naturally from the existing content. Do not repeat anything already present.
- Keep the tone consistent with the note's language and voice.`;
}

export function buildSystemPrompt(
  attachedNote: AttachedNote | null,
  mode: ChatMode = "chat",
): string {
  if (!attachedNote) return FREE_PROMPT;
  if (mode === "writer") return writerWithNote(attachedNote);
  return chatWithNote(attachedNote);
}
