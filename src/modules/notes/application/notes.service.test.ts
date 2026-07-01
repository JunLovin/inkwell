import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createNotesService } from "./notes.service";
import type {
  NoteMutations,
  NoteRepositoryPort,
} from "../domain/repositories/note.repository";
import type { Note, NoteId } from "../domain/entities/note";
import { makeNote as baseMakeNote } from "../__test-utils__/factories";

const makeNote = (id: string, overrides: Partial<Note> = {}): Note =>
  baseMakeNote({
    _id: id as NoteId,
    _creationTime: 1,
    authorId: "u" as Note["authorId"],
    slug: id,
    title: `Note ${id}`,
    ...overrides,
  });

function makeRepo(
  notes: Note[] = [],
  mutationOverrides: Partial<NoteMutations> = {},
): NoteRepositoryPort {
  const mutations: NoteMutations = {
    create: vi.fn(async () => {}),
    update: vi.fn(async () => {}),
    archive: vi.fn(async () => {}),
    restore: vi.fn(async () => {}),
    favorite: vi.fn(async () => {}),
    unfavorite: vi.fn(async () => {}),
    pin: vi.fn(async () => {}),
    unpin: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
    bulkArchive: vi.fn(async () => {}),
    bulkDelete: vi.fn(async () => {}),
    ...mutationOverrides,
  };
  return {
    useList: () => ({ notes, isLoading: false }),
    useFavoriteList: () => ({
      notes: notes.filter((n) => n.isFavorite),
      isLoading: false,
    }),
    useArchivedList: () => ({
      notes: notes.filter((n) => n.isArchived),
      isLoading: false,
    }),
    useGet: (slug) => ({
      note: notes.find((n) => n.slug === slug),
      isLoading: false,
    }),
    useSearch: (search) => ({
      notes: notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()),
      ),
      isLoading: false,
    }),
    useMutations: () => mutations,
  };
}

describe("createNotesService", () => {
  describe("useAllNotes", () => {
    it("delegates to repo.useList", () => {
      const note = makeNote("a");
      const svc = createNotesService(makeRepo([note]));
      const { result } = renderHook(() => svc.useAllNotes());
      expect(result.current.notes).toEqual([note]);
    });
  });

  describe("useActiveNotes", () => {
    it("filters out archived and favorite notes", () => {
      const active = makeNote("a");
      const archived = makeNote("b", { isArchived: true });
      const favorite = makeNote("c", { isFavorite: true });
      const svc = createNotesService(makeRepo([active, archived, favorite]));
      const { result } = renderHook(() => svc.useActiveNotes("", "desc"));
      expect(result.current.notes).toEqual([active]);
    });
  });

  describe("useNoteCounts", () => {
    it("computes counts excluding deleted", () => {
      const active = makeNote("a");
      const fav = makeNote("b", { isFavorite: true });
      const arch = makeNote("c", { isArchived: true });
      const del = makeNote("d", { isDeleted: true });
      const svc = createNotesService(makeRepo([active, fav, arch, del]));
      const { result } = renderHook(() => svc.useNoteCounts());
      expect(result.current).toEqual({
        total: 3,
        active: 1,
        favorite: 1,
        archived: 1,
      });
    });
  });

  describe("useNoteActions.createNote", () => {
    it("trims title and uses slug from the trimmed title", async () => {
      const create = vi.fn(async () => {});
      const svc = createNotesService(makeRepo([], { create }));
      const { result } = renderHook(() => svc.useNoteActions());
      await result.current.createNote({
        title: "  Hello World  ",
        content: "{}",
        preview: " p ",
      });
      expect(create).toHaveBeenCalledWith({
        title: "Hello World",
        slug: "hello-world",
        content: "{}",
        preview: "p",
      });
    });

    it('falls back to "Untitled" when title is empty', async () => {
      const create = vi.fn(async () => {});
      const svc = createNotesService(makeRepo([], { create }));
      const { result } = renderHook(() => svc.useNoteActions());
      await result.current.createNote({
        title: "   ",
        content: "{}",
        preview: "",
      });
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Untitled", slug: "untitled" }),
      );
    });
  });

  describe("useNoteActions delegations", () => {
    it("exposes all mutation methods bound to the repo", () => {
      const mutations: NoteMutations = {
        create: vi.fn(async () => {}),
        update: vi.fn(async () => {}),
        archive: vi.fn(async () => {}),
        restore: vi.fn(async () => {}),
        favorite: vi.fn(async () => {}),
        unfavorite: vi.fn(async () => {}),
        pin: vi.fn(async () => {}),
        unpin: vi.fn(async () => {}),
        remove: vi.fn(async () => {}),
        bulkArchive: vi.fn(async () => {}),
        bulkDelete: vi.fn(async () => {}),
      };
      const svc = createNotesService(makeRepo([], mutations));
      const { result } = renderHook(() => svc.useNoteActions());
      expect(result.current.archiveNote).toBe(mutations.archive);
      expect(result.current.restoreNote).toBe(mutations.restore);
      expect(result.current.favoriteNote).toBe(mutations.favorite);
      expect(result.current.unfavoriteNote).toBe(mutations.unfavorite);
      expect(result.current.pinNote).toBe(mutations.pin);
      expect(result.current.unpinNote).toBe(mutations.unpin);
      expect(result.current.deleteNote).toBe(mutations.remove);
      expect(result.current.bulkArchiveNotes).toBe(mutations.bulkArchive);
      expect(result.current.bulkDeleteNotes).toBe(mutations.bulkDelete);
      expect(result.current.updateNote).toBe(mutations.update);
    });
  });
});
