"use client";

import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type {
  FolderMutations,
  FolderRepositoryPort,
} from "../../domain/repositories/folder.repository";

export const convexFolderRepository: FolderRepositoryPort = {
  useList: () => {
    const folders = useQuery(api.folders.listFolders, {});
    return { folders: folders ?? undefined, isLoading: folders === undefined };
  },

  useMutations: (): FolderMutations => {
    const createFolder = useMutation(api.folders.createFolder);
    const renameFolder = useMutation(api.folders.renameFolder);
    const deleteFolder = useMutation(api.folders.deleteFolder);
    const moveNote = useMutation(api.folders.moveNoteToFolder);
    const removeNote = useMutation(api.folders.removeNoteFromFolder);
    const createAndAssign = useMutation(api.folders.createAndAssignFolder);

    return {
      create: async (input) => {
        return await createFolder(input);
      },
      rename: async (id, name) => {
        await renameFolder({ id, name });
      },
      remove: async (id) => {
        await deleteFolder({ id });
      },
      moveNote: async (noteId, folderId) => {
        await moveNote({ noteId, folderId });
      },
      removeNote: async (noteId) => {
        await removeNote({ noteId });
      },
      createAndAssign: async ({ noteId, name, color }) => {
        return await createAndAssign({ noteId, name, color });
      },
    };
  },
};
