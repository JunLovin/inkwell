"use client";

import type { Id } from "@/convex/_generated/dataModel";
import type { FolderRepositoryPort } from "../domain/repositories/folder.repository";

type NoteId = Id<"notes">;

export function createFoldersService(repo: FolderRepositoryPort) {
  return {
    useAllFolders: () => repo.useList(),

    useFolderActions: () => {
      const m = repo.useMutations();
      return {
        createFolder: async (name: string, color: string) =>
          m.create({ name, color }),
        renameFolder: m.rename,
        deleteFolder: m.remove,
        moveNoteToFolder: m.moveNote,
        removeNoteFromFolder: m.removeNote,
        createAndAssignFolder: async (
          noteId: NoteId,
          name: string,
          color: string,
        ) => m.createAndAssign({ noteId, name, color }),
      };
    },
  };
}
