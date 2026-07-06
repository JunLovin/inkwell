"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  BulkResult,
  NoteMutations,
  NoteRepositoryPort,
} from "../../domain/repositories/note.repository";

const emptyBulkResult: BulkResult = { processed: 0, skipped: 0 };

export const convexNoteRepository: NoteRepositoryPort = {
  useList: () => {
    const notes = useQuery(api.notes.listNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useFavoriteList: () => {
    const notes = useQuery(api.notes.listFavoriteNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useArchivedList: () => {
    const notes = useQuery(api.notes.listArchivedNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useDeletedList: () => {
    const notes = useQuery(api.notes.listDeletedNotes, {});
    return { notes: notes ?? undefined, isLoading: notes === undefined };
  },

  useGet: (slug: string) => {
    const note = useQuery(api.notes.getNoteBySlug, slug ? { slug } : "skip");
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
    const createMutation = useMutation(api.notes.createNote);
    const updateMutation = useMutation(api.notes.updateNote);
    const archiveMutation = useMutation(api.notes.archiveNote);
    const restoreMutation = useMutation(api.notes.restoreNote);
    const favoriteMutation = useMutation(api.notes.favoriteNote);
    const unfavoriteMutation = useMutation(api.notes.unfavoriteNote);
    const pinMutation = useMutation(api.notes.pinNote);
    const unpinMutation = useMutation(api.notes.unpinNote);
    const deleteMutation = useMutation(api.notes.deleteNote);
    const purgeMutation = useMutation(api.notes.purgeNote);
    const bulkArchiveMutation = useMutation(api.notes.bulkArchiveNotes);
    const bulkDeleteMutation = useMutation(api.notes.bulkDeleteNotes);
    const bulkPurgeMutation = useMutation(api.notes.bulkPurgeNotes);

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
      hardRemove: async (id) => {
        await purgeMutation({ id });
      },
      bulkArchive: async (ids) => {
        const result = await bulkArchiveMutation({ ids });
        return result ?? emptyBulkResult;
      },
      bulkDelete: async (ids) => {
        const result = await bulkDeleteMutation({ ids });
        return result ?? emptyBulkResult;
      },
      bulkHardDelete: async (ids) => {
        const result = await bulkPurgeMutation({ ids });
        return result ?? emptyBulkResult;
      },
    };
  },
};
