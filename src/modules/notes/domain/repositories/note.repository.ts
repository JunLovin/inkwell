import type { Note, NoteId } from "../entities/note";

export type CreateNoteInput = {
  title: string;
  slug: string;
  content: string;
  preview: string;
};

export type UpdateNoteInput = {
  id: NoteId;
  title?: string;
  content?: string;
  preview?: string;
};

export type BulkResult = { processed: number; skipped: number };

export type NoteMutations = {
  create: (input: CreateNoteInput) => Promise<void>;
  update: (input: UpdateNoteInput) => Promise<void>;
  archive: (id: NoteId) => Promise<void>;
  restore: (id: NoteId) => Promise<void>;
  favorite: (id: NoteId) => Promise<void>;
  unfavorite: (id: NoteId) => Promise<void>;
  pin: (id: NoteId) => Promise<void>;
  unpin: (id: NoteId) => Promise<void>;
  remove: (id: NoteId) => Promise<void>;
  hardRemove: (id: NoteId) => Promise<void>;
  bulkArchive: (ids: NoteId[]) => Promise<BulkResult>;
  bulkDelete: (ids: NoteId[]) => Promise<BulkResult>;
  bulkHardDelete: (ids: NoteId[]) => Promise<BulkResult>;
};

export type NoteRepositoryPort = {
  useList: () => { notes: Note[] | undefined; isLoading: boolean };
  useFavoriteList: () => { notes: Note[] | undefined; isLoading: boolean };
  useArchivedList: () => { notes: Note[] | undefined; isLoading: boolean };
  useDeletedList: () => { notes: Note[] | undefined; isLoading: boolean };
  useGet: (slug: string) => { note: Note | undefined; isLoading: boolean };
  useSearch: (search: string) => {
    notes: Note[] | undefined;
    isLoading: boolean;
  };
  useMutations: () => NoteMutations;
};
