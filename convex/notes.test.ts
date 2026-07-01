import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test-utils";

const modules = import.meta.glob("./**/*.ts");

describe("notes auth guards", () => {
  test("getNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.getNotes, {})).rejects.toThrow();
  });

  test("getArchivedNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.getArchivedNotes, {})).rejects.toThrow();
  });

  test("getFavoriteNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.getFavoriteNotes, {})).rejects.toThrow();
  });

  test("searchNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.query(api.notes.searchNotes, { search: "x" }),
    ).rejects.toThrow();
  });

  test("addNote throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.notes.addNote, {
        title: "t",
        slug: "s",
        content: "{}",
        preview: "",
      }),
    ).rejects.toThrow();
  });
});

describe("notes CRUD with auth", () => {
  test("addNote inserts a note for the authenticated user", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "alice");
    await asUser.mutation(api.notes.addNote, {
      title: "Hello",
      slug: "hello",
      content: "{}",
      preview: "Hello",
    });
    const notes = await asUser.query(api.notes.getNotes, {});
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ title: "Hello", slug: "hello" });
    expect(notes[0].isDeleted).toBe(false);
    expect(notes[0].isArchived).toBe(false);
    expect(notes[0].isFavorite).toBe(false);
    expect(notes[0].isPinned).toBe(false);
  });

  test("getNote throws notFound for unknown slug", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.query(api.notes.getNote, { slug: "nope" }),
    ).rejects.toThrow();
  });

  test("getNote returns the matching note for the author", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s1",
      content: "{}",
      preview: "",
    });
    const note = await asUser.query(api.notes.getNote, { slug: "s1" });
    expect(note.slug).toBe("s1");
  });

  test("isolates notes between users", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "alice");
    const { asUser: b } = await seedUser(t, "bob");
    await a.mutation(api.notes.addNote, {
      title: "a",
      slug: "a",
      content: "{}",
      preview: "",
    });
    await b.mutation(api.notes.addNote, {
      title: "b",
      slug: "b",
      content: "{}",
      preview: "",
    });
    expect(await a.query(api.notes.getNotes, {})).toHaveLength(1);
    expect(await b.query(api.notes.getNotes, {})).toHaveLength(1);
  });
});

describe("notes state transitions", () => {
  test("archiveNote shows in getArchivedNotes", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.archiveNote, { id: note._id });
    const archived = await asUser.query(api.notes.getArchivedNotes, {});
    expect(archived).toHaveLength(1);
    expect(archived[0]._id).toBe(note._id);
  });

  test("restoreNote clears isArchived", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.archiveNote, { id: note._id });
    await asUser.mutation(api.notes.restoreNote, { id: note._id });
    expect(await asUser.query(api.notes.getArchivedNotes, {})).toHaveLength(0);
  });

  test("markNoteAsFavorite and removeFavoriteNote toggle isFavorite", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.markNoteAsFavorite, { id: note._id });
    expect(await asUser.query(api.notes.getFavoriteNotes, {})).toHaveLength(1);
    await asUser.mutation(api.notes.removeFavoriteNote, { id: note._id });
    expect(await asUser.query(api.notes.getFavoriteNotes, {})).toHaveLength(0);
  });

  test("pinNote and unpinNote toggle isPinned", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.pinNote, { id: note._id });
    const pinned = (await asUser.query(api.notes.getNotes, {}))[0];
    expect(pinned.isPinned).toBe(true);
    await asUser.mutation(api.notes.unpinNote, { id: note._id });
    const unpinned = (await asUser.query(api.notes.getNotes, {}))[0];
    expect(unpinned.isPinned).toBe(false);
  });

  test("deleteNote sets isDeleted (soft delete)", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.deleteNote, { id: note._id });
    const all = await asUser.query(api.notes.getNotes, {});
    expect(all[0].isDeleted).toBe(true);
  });

  test("updateNote patches title and preview", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "old",
      slug: "s",
      content: "{}",
      preview: "old preview",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.updateNote, {
      id: note._id,
      title: "new",
      preview: "new preview",
    });
    const after = await asUser.query(api.notes.getNote, { slug: "s" });
    expect(after.title).toBe("new");
    expect(after.preview).toBe("new preview");
  });
});

describe("notes cross-user authorization", () => {
  test("updateNote rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.addNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.getNotes, {});
    await expect(
      b.mutation(api.notes.updateNote, { id: note._id, title: "x" }),
    ).rejects.toThrow();
  });

  test("deleteNote rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.addNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.getNotes, {});
    await expect(
      b.mutation(api.notes.deleteNote, { id: note._id }),
    ).rejects.toThrow();
  });

  test("bulkArchive silently skips notes owned by another user", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.addNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.getNotes, {});
    await b.mutation(api.notes.bulkArchiveNotes, { ids: [note._id] });
    const after = await a.query(api.notes.getNotes, {});
    expect(after[0].isArchived).toBe(false);
  });

  test("bulkDelete silently skips notes owned by another user", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.addNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.getNotes, {});
    await b.mutation(api.notes.bulkDeleteNotes, { ids: [note._id] });
    const after = await a.query(api.notes.getNotes, {});
    expect(after[0].isDeleted).toBe(false);
  });
});

describe("searchNotes", () => {
  test("returns empty array for empty/whitespace search", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    expect(await asUser.query(api.notes.searchNotes, { search: "" })).toEqual(
      [],
    );
    expect(
      await asUser.query(api.notes.searchNotes, { search: "   " }),
    ).toEqual([]);
  });

  test("matches notes by title", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "Refactor plan",
      slug: "refactor-plan",
      content: "{}",
      preview: "",
    });
    await asUser.mutation(api.notes.addNote, {
      title: "Grocery list",
      slug: "grocery-list",
      content: "{}",
      preview: "",
    });
    const results = await asUser.query(api.notes.searchNotes, {
      search: "refactor",
    });
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("refactor-plan");
  });

  test("excludes deleted notes from search results", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.addNote, {
      title: "Refactor plan",
      slug: "refactor-plan",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.notes.deleteNote, { id: note._id });
    const results = await asUser.query(api.notes.searchNotes, {
      search: "refactor",
    });
    expect(results).toEqual([]);
  });
});
