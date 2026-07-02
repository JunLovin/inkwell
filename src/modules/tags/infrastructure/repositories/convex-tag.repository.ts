"use client";

import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type {
  TagMutations,
  TagRepositoryPort,
} from "../../domain/repositories/tag.repository";

export const convexTagRepository: TagRepositoryPort = {
  useList: () => {
    const tags = useQuery(api.tags.listTags, {});
    return { tags: tags ?? undefined, isLoading: tags === undefined };
  },

  useTagsForNote: (noteId) => {
    const tags = useQuery(
      api.tags.listTagsForNote,
      noteId ? { noteId } : "skip",
    );
    return {
      tags: tags ?? undefined,
      isLoading: noteId !== undefined && tags === undefined,
    };
  },

  useAllLinks: () => {
    const links = useQuery(api.tags.listAllNoteTagLinks, {});
    return { links: links ?? undefined, isLoading: links === undefined };
  },

  useMutations: (): TagMutations => {
    const createTag = useMutation(api.tags.createTag);
    const renameTag = useMutation(api.tags.renameTag);
    const deleteTag = useMutation(api.tags.deleteTag);
    const assignTag = useMutation(api.tags.assignTagToNote);
    const unassignTag = useMutation(api.tags.unassignTagFromNote);
    const createAndAssign = useMutation(api.tags.createAndAssignTag);

    return {
      create: async (input) => {
        return await createTag(input);
      },
      rename: async (id, name) => {
        await renameTag({ id, name });
      },
      remove: async (id) => {
        await deleteTag({ id });
      },
      assignToNote: async (noteId, tagId) => {
        await assignTag({ noteId, tagId });
      },
      unassignFromNote: async (noteId, tagId) => {
        await unassignTag({ noteId, tagId });
      },
      createAndAssign: async ({ noteId, name, color }) => {
        return await createAndAssign({ noteId, name, color });
      },
    };
  },
};
