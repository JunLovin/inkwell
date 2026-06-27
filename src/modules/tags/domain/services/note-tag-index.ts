import type { Id } from "@/convex/_generated/dataModel";
import type { NoteTagLink } from "../entities/tag";

export type NoteTagsByNote = Map<Id<"notes">, Id<"tags">[]>;

export function buildNoteTagsIndex(
  links: NoteTagLink[] | undefined,
): NoteTagsByNote {
  const index: NoteTagsByNote = new Map();
  if (!links) return index;
  for (const link of links) {
    const existing = index.get(link.noteId);
    if (existing) existing.push(link.tagId);
    else index.set(link.noteId, [link.tagId]);
  }
  return index;
}

export function noteMatchesAllTags(
  noteTagIds: Id<"tags">[] | undefined,
  required: Id<"tags">[],
): boolean {
  if (required.length === 0) return true;
  if (!noteTagIds || noteTagIds.length === 0) return false;
  const set = new Set(noteTagIds);
  return required.every((id) => set.has(id));
}
