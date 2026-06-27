"use client";

import type { FolderRepositoryPort } from "../domain/repositories/folder.repository";

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
      };
    },
  };
}
