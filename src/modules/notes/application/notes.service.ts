"use client";

import { useMemo } from "react";
import type { Note } from "../domain/entities/note";
import type {
  CreateNoteInput,
  CreateNoteResult,
  NoteRepositoryPort,
} from "../domain/repositories/note.repository";
import {
  filterAndSort,
  countByStatus,
  type SortOrder,
  type NoteStatusFilter,
} from "../domain/services/note-filter";
import { generateSlug } from "../domain/value-objects/note-slug";

export type NotesListView = {
  notes: Note[];
  isLoading: boolean;
};

export type CreateNoteDraft = {
  title: string;
  content: string;
  preview: string;
};

export function createNotesService(repo: NoteRepositoryPort) {
  function useFilteredNotes(
    source: { notes: Note[] | undefined; isLoading: boolean },
    status: NoteStatusFilter,
    search: string,
    sortOrder: SortOrder,
  ): NotesListView {
    const filtered = useMemo(
      () => filterAndSort(source.notes ?? [], { status, search, sortOrder }),
      [source.notes, status, search, sortOrder],
    );
    return { notes: filtered, isLoading: source.isLoading };
  }

  return {
    useAllNotes: () => repo.useList(),

    useActiveNotes: (search: string, sortOrder: SortOrder): NotesListView =>
      useFilteredNotes(repo.useList(), "active", search, sortOrder),

    useFavoriteNotes: (search: string, sortOrder: SortOrder): NotesListView =>
      useFilteredNotes(repo.useFavoriteList(), "favorite", search, sortOrder),

    useArchivedNotes: (search: string, sortOrder: SortOrder): NotesListView =>
      useFilteredNotes(repo.useArchivedList(), "archived", search, sortOrder),

    useDeletedNotes: (search: string, sortOrder: SortOrder): NotesListView => {
      const source = repo.useDeletedList();
      const filtered = useMemo(() => {
        const list = source.notes ?? [];
        const s = search.trim().toLowerCase();
        const matched = s
          ? list.filter((n) => n.title.toLowerCase().includes(s))
          : list;
        return [...matched].sort((a, b) => {
          const at = a.updatedAt ?? a._creationTime;
          const bt = b.updatedAt ?? b._creationTime;
          return sortOrder === "desc" ? bt - at : at - bt;
        });
      }, [source.notes, search, sortOrder]);
      return { notes: filtered, isLoading: source.isLoading };
    },

    useNote: (slug: string) => repo.useGet(slug),

    useNotesSearch: (search: string) => repo.useSearch(search),

    useNoteCounts: () => {
      const { notes } = repo.useList();
      return useMemo(() => countByStatus(notes ?? []), [notes]);
    },

    useNoteActions: () => {
      const mutations = repo.useMutations();
      return {
        createNote: async (
          draft: CreateNoteDraft,
        ): Promise<CreateNoteResult> => {
          const title = draft.title.trim() || "Untitled";
          const input: CreateNoteInput = {
            title,
            slug: generateSlug(title),
            content: draft.content,
            preview: draft.preview.trim(),
          };
          return mutations.create(input);
        },
        updateNote: mutations.update,
        archiveNote: mutations.archive,
        restoreNote: mutations.restore,
        favoriteNote: mutations.favorite,
        unfavoriteNote: mutations.unfavorite,
        pinNote: mutations.pin,
        unpinNote: mutations.unpin,
        deleteNote: mutations.remove,
        hardDeleteNote: mutations.hardRemove,
        bulkArchiveNotes: mutations.bulkArchive,
        bulkDeleteNotes: mutations.bulkDelete,
        bulkHardDeleteNotes: mutations.bulkHardDelete,
      };
    },
  };
}
