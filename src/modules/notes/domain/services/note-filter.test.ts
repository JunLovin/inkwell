import { describe, expect, it } from "vitest";

import type { Note, NoteId } from "../entities/note";
import { makeNote as baseMakeNote } from "../../__test-utils__/factories";
import { countByStatus, filterAndSort } from "./note-filter";

type NoteOverrides = Partial<Omit<Note, "_id">> & { _id?: string };

const makeNote = (overrides: NoteOverrides = {}): Note =>
  baseMakeNote({
    _id: "n1" as NoteId,
    _creationTime: 1000,
    authorId: "u1" as Note["authorId"],
    slug: "untitled",
    title: "Untitled",
    ...(overrides as Partial<Note>),
  });

describe("filterAndSort", () => {
  it("excludes deleted notes from every status filter", () => {
    const notes = [
      makeNote({ _id: "a", title: "Alive", isDeleted: false }),
      makeNote({ _id: "b", title: "Gone", isDeleted: true }),
    ];

    expect(filterAndSort(notes, { status: "all" }).map((n) => n._id)).toEqual([
      "a",
    ]);
    expect(
      filterAndSort(notes, { status: "active" }).map((n) => n._id),
    ).toEqual(["a"]);
  });

  it("matches active = not deleted, not archived, not favorite", () => {
    const notes = [
      makeNote({ _id: "active" }),
      makeNote({ _id: "fav", isFavorite: true }),
      makeNote({ _id: "arch", isArchived: true }),
    ];

    expect(
      filterAndSort(notes, { status: "active" }).map((n) => n._id),
    ).toEqual(["active"]);
  });

  it("matches favorites + archived by their flag", () => {
    const notes = [
      makeNote({ _id: "1" }),
      makeNote({ _id: "2", isFavorite: true }),
      makeNote({ _id: "3", isArchived: true }),
    ];

    expect(
      filterAndSort(notes, { status: "favorite" }).map((n) => n._id),
    ).toEqual(["2"]);
    expect(
      filterAndSort(notes, { status: "archived" }).map((n) => n._id),
    ).toEqual(["3"]);
  });

  it("search is case-insensitive on title only", () => {
    const notes = [
      makeNote({ _id: "1", title: "Hello World" }),
      makeNote({ _id: "2", title: "foo" }),
    ];

    expect(filterAndSort(notes, { search: "hello" }).map((n) => n._id)).toEqual(
      ["1"],
    );
    expect(filterAndSort(notes, { search: "WORLD" }).map((n) => n._id)).toEqual(
      ["1"],
    );
  });

  it("sorts by updatedAt desc by default, falls back to _creationTime", () => {
    const notes = [
      makeNote({ _id: "a", _creationTime: 100, updatedAt: 300 }),
      makeNote({ _id: "b", _creationTime: 200 }),
      makeNote({ _id: "c", _creationTime: 50, updatedAt: 500 }),
    ];

    expect(filterAndSort(notes).map((n) => n._id)).toEqual(["c", "a", "b"]);
  });

  it("sortOrder=asc reverses the order", () => {
    const notes = [
      makeNote({ _id: "a", updatedAt: 300 }),
      makeNote({ _id: "b", updatedAt: 100 }),
    ];

    expect(
      filterAndSort(notes, { sortOrder: "asc" }).map((n) => n._id),
    ).toEqual(["b", "a"]);
  });

  it("pinned notes always sort first regardless of sortOrder", () => {
    const notes = [
      makeNote({ _id: "old-pinned", updatedAt: 100, isPinned: true }),
      makeNote({ _id: "new-unpinned", updatedAt: 500 }),
      makeNote({ _id: "mid-pinned", updatedAt: 300, isPinned: true }),
    ];

    expect(filterAndSort(notes).map((n) => n._id)).toEqual([
      "mid-pinned",
      "old-pinned",
      "new-unpinned",
    ]);

    expect(
      filterAndSort(notes, { sortOrder: "asc" }).map((n) => n._id),
    ).toEqual(["old-pinned", "mid-pinned", "new-unpinned"]);
  });
});

describe("countByStatus", () => {
  it("counts excluding deleted notes", () => {
    const notes = [
      makeNote({ _id: "1" }),
      makeNote({ _id: "2", isFavorite: true }),
      makeNote({ _id: "3", isArchived: true }),
      makeNote({ _id: "4", isDeleted: true }),
    ];

    expect(countByStatus(notes)).toEqual({
      total: 3,
      active: 1,
      favorite: 1,
      archived: 1,
    });
  });

  it("returns zeros for empty input", () => {
    expect(countByStatus([])).toEqual({
      total: 0,
      active: 0,
      favorite: 0,
      archived: 0,
    });
  });
});
