import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test-utils";

const modules = import.meta.glob("./**/*.ts");

describe("tags auth guards", () => {
  test("listTags throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.tags.listTags, {})).rejects.toThrow();
  });

  test("createTag throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.tags.createTag, { name: "x", color: "r" }),
    ).rejects.toThrow();
  });
});

describe("createTag / renameTag", () => {
  test("creates a tag with trimmed name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.tags.createTag, { name: "  ideas ", color: "g" });
    const tags = await asUser.query(api.tags.listTags, {});
    expect(tags[0]).toMatchObject({ name: "ideas", color: "g" });
  });

  test("rejects empty / duplicate names", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.mutation(api.tags.createTag, { name: "   ", color: "r" }),
    ).rejects.toThrow();
    await asUser.mutation(api.tags.createTag, { name: "X", color: "r" });
    await expect(
      asUser.mutation(api.tags.createTag, { name: "X", color: "b" }),
    ).rejects.toThrow();
  });

  test("renameTag rejects non-owner", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.tags.createTag, { name: "x", color: "r" });
    const [tag] = await a.query(api.tags.listTags, {});
    await expect(
      b.mutation(api.tags.renameTag, { id: tag._id, name: "y" }),
    ).rejects.toThrow();
  });
});

describe("deleteTag", () => {
  test("removes the tag and its noteTags links", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.tags.createTag, { name: "t", color: "r" });
    const [tag] = await asUser.query(api.tags.listTags, {});
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.tags.assignTagToNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    await asUser.mutation(api.tags.deleteTag, { id: tag._id });
    expect(await asUser.query(api.tags.listTags, {})).toHaveLength(0);
    expect(await asUser.query(api.tags.listAllNoteTagLinks, {})).toHaveLength(
      0,
    );
  });
});

describe("assignTagToNote / unassignTagFromNote", () => {
  test("assigns a tag once even when called twice", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.tags.createTag, { name: "t", color: "r" });
    const [tag] = await asUser.query(api.tags.listTags, {});
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.tags.assignTagToNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    await asUser.mutation(api.tags.assignTagToNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    expect(await asUser.query(api.tags.listAllNoteTagLinks, {})).toHaveLength(
      1,
    );
  });

  test("unassignTagFromNote removes the link", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.tags.createTag, { name: "t", color: "r" });
    const [tag] = await asUser.query(api.tags.listTags, {});
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.tags.assignTagToNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    await asUser.mutation(api.tags.unassignTagFromNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    expect(await asUser.query(api.tags.listAllNoteTagLinks, {})).toHaveLength(
      0,
    );
  });

  test("rejects cross-user assignments", async () => {
    const t = convexTest(schema, modules);
    const { asUser: a } = await seedUser(t, "a");
    const { asUser: b } = await seedUser(t, "b");
    await a.mutation(api.tags.createTag, { name: "t", color: "r" });
    const [aTag] = await a.query(api.tags.listTags, {});
    await b.mutation(api.notes.addNote, {
      title: "x",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [bNote] = await b.query(api.notes.getNotes, {});
    await expect(
      b.mutation(api.tags.assignTagToNote, {
        noteId: bNote._id,
        tagId: aTag._id,
      }),
    ).rejects.toThrow();
  });
});

describe("listTagsForNote", () => {
  test("returns only tags owned by the requesting user", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await asUser.mutation(api.tags.createTag, { name: "t", color: "r" });
    const [tag] = await asUser.query(api.tags.listTags, {});
    await asUser.mutation(api.notes.addNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    const [note] = await asUser.query(api.notes.getNotes, {});
    await asUser.mutation(api.tags.assignTagToNote, {
      noteId: note._id,
      tagId: tag._id,
    });
    const tags = await asUser.query(api.tags.listTagsForNote, {
      noteId: note._id,
    });
    expect(tags).toHaveLength(1);
    expect(tags[0]._id).toBe(tag._id);
  });
});
