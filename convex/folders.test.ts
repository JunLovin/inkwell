import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test_utils";

const modules = import.meta.glob("./**/*.ts");

describe("folders auth guards", () => {
  test("listFolders throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.folders.listFolders, {})).rejects.toThrow();
  });

  test("createFolder throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.folders.createFolder, { name: "x", color: "red" }),
    ).rejects.toThrow();
  });
});

describe("createFolder", () => {
  test("inserts a folder with the trimmed name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, {
      name: "  Notes  ",
      color: "blue",
    });
    const list = await asUser.query(api.folders.listFolders, {});
    expect(list[0]).toMatchObject({ name: "Notes", color: "blue" });
  });

  test("rejects an empty name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.mutation(api.folders.createFolder, { name: "   ", color: "r" }),
    ).rejects.toThrow();
  });

  test("rejects duplicate names per author", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, { name: "X", color: "r" });
    await expect(
      asUser.mutation(api.folders.createFolder, { name: "X", color: "b" }),
    ).rejects.toThrow();
  });
});

describe("renameFolder", () => {
  test("trims and updates the name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, { name: "a", color: "r" });
    const [folder] = await asUser.query(api.folders.listFolders, {});
    await asUser.mutation(api.folders.renameFolder, {
      id: folder._id,
      name: "  b  ",
    });
    const after = (await asUser.query(api.folders.listFolders, {}))[0];
    expect(after.name).toBe("b");
  });

  test("rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.folders.createFolder, { name: "x", color: "r" });
    const [folder] = await a.query(api.folders.listFolders, {});
    await expect(
      b.mutation(api.folders.renameFolder, { id: folder._id, name: "y" }),
    ).rejects.toThrow();
  });

  test("rejects rename to an existing folder name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, { name: "a", color: "r" });
    await asUser.mutation(api.folders.createFolder, { name: "b", color: "r" });
    const list = await asUser.query(api.folders.listFolders, {});
    await expect(
      asUser.mutation(api.folders.renameFolder, { id: list[0]._id, name: "b" }),
    ).rejects.toThrow();
  });
});

describe("deleteFolder", () => {
  test("removes the folder and clears folderId on notes", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, {
      name: "box",
      color: "r",
    });
    const [folder] = await asUser.query(api.folders.listFolders, {});
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.folders.moveNoteToFolder, {
      noteId: note._id,
      folderId: folder._id,
    });
    await asUser.mutation(api.folders.deleteFolder, { id: folder._id });
    const after = await asUser.query(api.notes.getNoteBySlug, { slug: "s" });
    expect(after?.folderId).toBeUndefined();
    expect(await asUser.query(api.folders.listFolders, {})).toHaveLength(0);
  });

  test("rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.folders.createFolder, { name: "x", color: "r" });
    const [folder] = await a.query(api.folders.listFolders, {});
    await expect(
      b.mutation(api.folders.deleteFolder, { id: folder._id }),
    ).rejects.toThrow();
  });
});

describe("moveNoteToFolder / removeNoteFromFolder", () => {
  test("moves a note into a folder owned by the same user", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, { name: "x", color: "r" });
    const [folder] = await asUser.query(api.folders.listFolders, {});
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.folders.moveNoteToFolder, {
      noteId: note._id,
      folderId: folder._id,
    });
    const after = await asUser.query(api.notes.getNoteBySlug, { slug: "s" });
    expect(after?.folderId).toBe(folder._id);
  });

  test("removeNoteFromFolder clears folderId", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.folders.createFolder, { name: "x", color: "r" });
    const [folder] = await asUser.query(api.folders.listFolders, {});
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.listNotes, {});
    await asUser.mutation(api.folders.moveNoteToFolder, {
      noteId: note._id,
      folderId: folder._id,
    });
    await asUser.mutation(api.folders.removeNoteFromFolder, {
      noteId: note._id,
    });
    const after = await asUser.query(api.notes.getNoteBySlug, { slug: "s" });
    expect(after?.folderId).toBeUndefined();
  });

  test("rejects cross-user moves", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.folders.createFolder, { name: "x", color: "r" });
    const [folder] = await a.query(api.folders.listFolders, {});
    await b.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await b.query(api.notes.listNotes, {});
    await expect(
      b.mutation(api.folders.moveNoteToFolder, {
        noteId: note._id,
        folderId: folder._id,
      }),
    ).rejects.toThrow();
  });
});
