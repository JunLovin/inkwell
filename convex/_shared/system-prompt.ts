export type ChatMode = "chat" | "writer";

export type NoteContext = {
  title: string;
  plainText: string;
};

const BASE_PROMPT =
  "You are Inkwell Assistant, an AI helper for the Inkwell note-taking app.";

const FREE_PROMPT = `${BASE_PROMPT} Help the user with their notes, writing, and any questions they have.`;

function chatWithNote(note: NoteContext): string {
  return `${BASE_PROMPT} The user has shared a note with you. Here is its full content:\n\n---\n${note.plainText}\n---\n\nHelp the user with questions, summaries, or any tasks related to this note or their writing.`;
}

function writerWithNote(note: NoteContext): string {
  return `${BASE_PROMPT} You are in WRITER mode. The user is asking you to write content that will be appended directly into their note "${note.title}".

Existing note content:
---
${note.plainText || "(empty)"}
---

Rules:
- Reply with ONLY the markdown content to insert. No preamble, no meta-commentary, no wrapping code fences.
- Use standard markdown: # for headings, - for bullets, ** for bold, [text](url) for links.
- Continue naturally from the existing content. Do not repeat anything already present.
- Keep the tone consistent with the note's language and voice.`;
}

export function buildSystemInstruction(
  mode: ChatMode,
  note: NoteContext | null,
): string {
  if (!note) return FREE_PROMPT;
  if (mode === "writer") return writerWithNote(note);
  return chatWithNote(note);
}
