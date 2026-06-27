"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  NoteMutations,
  NoteRepositoryPort,
} from "../../domain/repositories/note.repository";

export const convexNoteRepository: NoteRepositoryPort = {
  useList: () => {
    const notes = useQuery(api.notes.getNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useFavoriteList: () => {
    const notes = useQuery(api.notes.getFavoriteNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useArchivedList: () => {
    const notes = useQuery(api.notes.getArchivedNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useGet: (slug: string) => {
    const note = useQuery(api.notes.getNote, slug ? { slug } : "skip");
    return { note: note ?? undefined, isLoading: note === undefined };
  },

  useSearch: (search: string) => {
    const trimmed = search.trim();
    const notes = useQuery(
      api.notes.searchNotes,
      trimmed ? { search: trimmed } : "skip",
    );
    return {
      notes: notes ?? undefined,
      isLoading: trimmed !== "" && notes === undefined,
    };
  },

  useMutations: (): NoteMutations => {
    const createMutation = useMutation(api.notes.addNote);
    const updateMutation = useMutation(api.notes.updateNote);
    const archiveMutation = useMutation(api.notes.archiveNote);
    const restoreMutation = useMutation(api.notes.restoreNote);
    const favoriteMutation = useMutation(api.notes.markNoteAsFavorite);
    const unfavoriteMutation = useMutation(api.notes.removeFavoriteNote);
    const pinMutation = useMutation(api.notes.pinNote);
    const unpinMutation = useMutation(api.notes.unpinNote);
    const deleteMutation = useMutation(api.notes.deleteNote);
    const bulkArchiveMutation = useMutation(api.notes.bulkArchiveNotes);
    const bulkDeleteMutation = useMutation(api.notes.bulkDeleteNotes);

    return {
      create: async (input) => {
        await createMutation(input);
      },
      update: async ({ id, ...patch }) => {
        await updateMutation({ id, ...patch });
      },
      archive: async (id) => {
        await archiveMutation({ id });
      },
      restore: async (id) => {
        await restoreMutation({ id });
      },
      favorite: async (id) => {
        await favoriteMutation({ id });
      },
      unfavorite: async (id) => {
        await unfavoriteMutation({ id });
      },
      pin: async (id) => {
        await pinMutation({ id });
      },
      unpin: async (id) => {
        await unpinMutation({ id });
      },
      remove: async (id) => {
        await deleteMutation({ id });
      },
      bulkArchive: async (ids) => {
        await bulkArchiveMutation({ ids });
      },
      bulkDelete: async (ids) => {
        await bulkDeleteMutation({ ids });
      },
    };
  },
};
