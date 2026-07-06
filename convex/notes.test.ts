import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test_utils";

const modules = import.meta.glob("./**/*.ts");

describe("notes auth guards", () => {
  test("listNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.listNotes, {})).rejects.toThrow();
  });

  test("listArchivedNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.listArchivedNotes, {})).rejects.toThrow();
  });

  test("listFavoriteNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.listFavoriteNotes, {})).rejects.toThrow();
  });

  test("listDeletedNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.notes.listDeletedNotes, {})).rejects.toThrow();
  });

  test("searchNotes throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.query(api.notes.searchNotes, { search: "x" }),
    ).rejects.toThrow();
  });

  test("createNote throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.notes.createNote, {
        title: "t",
        slug: "s",
        content: "{}",
        preview: "",
      }),
    ).rejects.toThrow();
  });
});

describe("notes CRUD with auth", () => {
  test("createNote inserts a note for the authenticated user", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "alice");
    await asUser.mutation(api.notes.createNote, {
      title: "Hello",
      slug: "hello",
      content: "{}",
      preview: "Hello",
    });
    const notes = await asUser.query(api.notes.listNotes, {});
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ title: "Hello", slug: "hello" });
    expect(notes[0].isDeleted).toBe(false);
    expect(notes[0].isArchived).toBe(false);
    expect(notes[0].isFavorite).toBe(false);
    expect(notes[0].isPinned).toBe(false);
  });

  test("getNoteBySlug returns null for unknown slug", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    const result = await asUser.query(api.notes.getNoteBySlug, {
      slug: "nope",
    });
    expect(result).toBeNull();
  });

  test("getNoteBySlug returns the matching note for the author", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s1",
      content: "{}",
      preview: "",
    });
    const note = await asUser.query(api.notes.getNoteBySlug, { slug: "s1" });
    expect(note?.slug).toBe("s1");
  });

  test("isolates notes between users", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "alice");
    const { asUser: b } = await seedUser(t, "bob");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "a",
      content: "{}",
      preview: "",
    });
    await b.mutation(api.notes.createNote, {
      title: "b",
      slug: "b",
      content: "{}",
      preview: "",
    });
    expect(await a.query(api.notes.listNotes, {})).toHaveLength(1);
    expect(await b.query(api.notes.listNotes, {})).toHaveLength(1);
  });
});

describe("notes state transitions", () => {
  test("archiveNote shows in listArchivedNotes", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.archiveNote, { id: note._id });
    const archived = await asUser.query(api.notes.listArchivedNotes, {});
    expect(archived).toHaveLength(1);
    expect(archived[0]._id).toBe(note._id);
  });

  test("restoreNote clears isArchived", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.archiveNote, { id: note._id });
    await asUser.mutation(api.notes.restoreNote, { id: note._id });
    expect(await asUser.query(api.notes.listArchivedNotes, {})).toHaveLength(0);
  });

  test("favoriteNote and unfavoriteNote toggle isFavorite", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.favoriteNote, { id: note._id });
    expect(await asUser.query(api.notes.listFavoriteNotes, {})).toHaveLength(1);
    await asUser.mutation(api.notes.unfavoriteNote, { id: note._id });
    expect(await asUser.query(api.notes.listFavoriteNotes, {})).toHaveLength(0);
  });

  test("pinNote and unpinNote toggle isPinned", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.pinNote, { id: note._id });
    const pinned = (await asUser.query(api.notes.listNotes, {}))[0];
    expect(pinned.isPinned).toBe(true);
    await asUser.mutation(api.notes.unpinNote, { id: note._id });
    const unpinned = (await asUser.query(api.notes.listNotes, {}))[0];
    expect(unpinned.isPinned).toBe(false);
  });

  test("deleteNote sets isDeleted and note shows in listDeletedNotes", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.deleteNote, { id: note._id });
    expect(await asUser.query(api.notes.listNotes, {})).toHaveLength(0);
    const deleted = await asUser.query(api.notes.listDeletedNotes, {});
    expect(deleted).toHaveLength(1);
    expect(deleted[0]._id).toBe(note._id);
  });

  test("purgeNote hard-deletes the note", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.purgeNote, { id: note._id });
    expect(await asUser.query(api.notes.listNotes, {})).toHaveLength(0);
    expect(await asUser.query(api.notes.listDeletedNotes, {})).toHaveLength(0);
  });

  test("updateNote patches title and preview", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "old",
      slug: "s",
      content: "{}",
      preview: "old preview",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.updateNote, {
      id: note._id,
      title: "new",
      preview: "new preview",
    });
    const after = await asUser.query(api.notes.getNoteBySlug, { slug: "s" });
    expect(after?.title).toBe("new");
    expect(after?.preview).toBe("new preview");
  });
});

describe("notes cross-user authorization", () => {
  test("updateNote rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.notes.updateNote, { id: note._id, title: "x" }),
    ).rejects.toThrow();
  });

  test("deleteNote rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.notes.deleteNote, { id: note._id }),
    ).rejects.toThrow();
  });

  test("bulkArchiveNotes rejects when any id is not owned", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.notes.bulkArchiveNotes, { ids: [note._id] }),
    ).rejects.toThrow();
    const after = await a.query(api.notes.listNotes, {});
    expect(after[0].isArchived).toBe(false);
  });

  test("bulkDeleteNotes rejects when any id is not owned", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.notes.bulkDeleteNotes, { ids: [note._id] }),
    ).rejects.toThrow();
    const after = await a.query(api.notes.listNotes, {});
    expect(after[0].isDeleted).toBe(false);
  });

  test("bulkPurgeNotes rejects when any id is not owned", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.notes.createNote, {
      title: "a",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await a.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.notes.bulkPurgeNotes, { ids: [note._id] }),
    ).rejects.toThrow();
    expect(await a.query(api.notes.listNotes, {})).toHaveLength(1);
  });
});

describe("bulk mutation size guards", () => {
  test("rejects empty ids array", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.mutation(api.notes.bulkArchiveNotes, { ids: [] }),
    ).rejects.toThrow();
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
    await asUser.mutation(api.notes.createNote, {
      title: "Refactor plan",
      slug: "refactor-plan",
      content: "{}",
      preview: "",
    });
    await asUser.mutation(api.notes.createNote, {
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
    await asUser.mutation(api.notes.createNote, {
      title: "Refactor plan",
      slug: "refactor-plan",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.notes.deleteNote, { id: note._id });
    const results = await asUser.query(api.notes.searchNotes, {
      search: "refactor",
    });
    expect(results).toEqual([]);
  });
});
