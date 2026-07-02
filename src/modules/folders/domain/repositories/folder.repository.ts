import type { Id } from "@/convex/_generated/dataModel";
import type { Folder, FolderId } from "../entities/folder";

type NoteId = Id<"notes">;

export type CreateFolderInput = {
  name: string;
  color: string;
};

export type CreateAndAssignFolderInput = {
  noteId: NoteId;
  name: string;
  color: string;
};

export type FolderMutations = {
  create: (input: CreateFolderInput) => Promise<FolderId>;
  rename: (id: FolderId, name: string) => Promise<void>;
  remove: (id: FolderId) => Promise<void>;
  moveNote: (noteId: NoteId, folderId: FolderId) => Promise<void>;
  removeNote: (noteId: NoteId) => Promise<void>;
  createAndAssign: (input: CreateAndAssignFolderInput) => Promise<FolderId>;
};

export type FolderRepositoryPort = {
  useList: () => { folders: Folder[] | undefined; isLoading: boolean };
  useMutations: () => FolderMutations;
};
