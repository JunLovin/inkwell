"use client";

import { useMemo } from "react";
import type { Note } from "../domain/entities/note";
import type {
  CreateNoteInput,
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
      () =>
        filterAndSort(source.notes ?? [], { status, search, sortOrder }),
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

    useNote: (slug: string) => repo.useGet(slug),

    useNoteCounts: () => {
      const { notes } = repo.useList();
      return useMemo(() => countByStatus(notes ?? []), [notes]);
    },

    useNoteActions: () => {
      const mutations = repo.useMutations();
      return {
        createNote: async (draft: CreateNoteDraft) => {
          const title = draft.title.trim() || "Untitled";
          const input: CreateNoteInput = {
            title,
            slug: generateSlug(title),
            content: draft.content,
            preview: draft.preview.trim(),
          };
          await mutations.create(input);
        },
        updateNote: mutations.update,
        archiveNote: mutations.archive,
        restoreNote: mutations.restore,
        favoriteNote: mutations.favorite,
        unfavoriteNote: mutations.unfavorite,
        deleteNote: mutations.remove,
      };
    },
  };
}
