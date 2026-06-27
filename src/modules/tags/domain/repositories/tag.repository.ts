import type { Id } from "@/convex/_generated/dataModel";
import type { NoteTagLink, Tag, TagId } from "../entities/tag";

type NoteId = Id<"notes">;

export type CreateTagInput = {
  name: string;
  color: string;
};

export type TagMutations = {
  create: (input: CreateTagInput) => Promise<TagId>;
  rename: (id: TagId, name: string) => Promise<void>;
  remove: (id: TagId) => Promise<void>;
  assignToNote: (noteId: NoteId, tagId: TagId) => Promise<void>;
  unassignFromNote: (noteId: NoteId, tagId: TagId) => Promise<void>;
};

export type TagRepositoryPort = {
  useList: () => { tags: Tag[] | undefined; isLoading: boolean };
  useTagsForNote: (
    noteId: NoteId | undefined,
  ) => { tags: Tag[] | undefined; isLoading: boolean };
  useAllLinks: () => {
    links: NoteTagLink[] | undefined;
    isLoading: boolean;
  };
  useMutations: () => TagMutations;
};
