"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type { TagRepositoryPort } from "../domain/repositories/tag.repository";

type NoteId = Id<"notes">;

export function createTagsService(repo: TagRepositoryPort) {
  return {
    useAllTags: () => repo.useList(),

    useTagsForNote: (noteId: NoteId | undefined) => repo.useTagsForNote(noteId),

    useAllNoteTagLinks: () => repo.useAllLinks(),

    useTagActions: () => {
      const m = repo.useMutations();
      return {
        createTag: async (name: string, color: string) =>
          m.create({ name, color }),
        renameTag: m.rename,
        deleteTag: m.remove,
        assignTagToNote: m.assignToNote,
        unassignTagFromNote: m.unassignFromNote,
        createAndAssignTag: async (
          noteId: NoteId,
          name: string,
          color: string,
        ) => m.createAndAssign({ noteId, name, color }),
      };
    },
  };
}
