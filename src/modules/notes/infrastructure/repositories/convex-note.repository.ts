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

  useMutations: (): NoteMutations => {
    const createMutation = useMutation(api.notes.addNote);
    const updateMutation = useMutation(api.notes.updateNote);
    const archiveMutation = useMutation(api.notes.archiveNote);
    const restoreMutation = useMutation(api.notes.restoreNote);
    const favoriteMutation = useMutation(api.notes.markNoteAsFavorite);
    const unfavoriteMutation = useMutation(api.notes.removeFavoriteNote);
    const deleteMutation = useMutation(api.notes.deleteNote);

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
      remove: async (id) => {
        await deleteMutation({ id });
      },
    };
  },
};
