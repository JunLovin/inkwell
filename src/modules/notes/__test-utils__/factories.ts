import type { Note, NoteId } from "../domain/entities/note";

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    _id: "note_1" as NoteId,
    _creationTime: 1,
    authorId: "user_1" as Note["authorId"],
    slug: "s",
    title: "t",
    ...overrides,
  } as Note;
}
