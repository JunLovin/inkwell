import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { errors } from "./_shared/errors";
import { requireUserId } from "./model/auth";
import { assertNoteOwner, assertTagOwner } from "./model/ownership";
import { cascadeDeleteTag } from "./model/cascade";

export const listTags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("tags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("asc")
      .take(500);
  },
});

export const createTag = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Tag name is required");

    const existing = await ctx.db
      .query("tags")
      .withIndex("by_author_and_name", (q) =>
        q.eq("authorId", userId).eq("name", name),
      )
      .first();
    if (existing) throw errors.invalidInput("Tag already exists");

    return await ctx.db.insert("tags", {
      authorId: userId,
      name,
      color: args.color,
    });
  },
});

export const renameTag = mutation({
  args: { id: v.id("tags"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tag = await assertTagOwner(ctx, args.id, userId);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Tag name is required");

    if (name !== tag.name) {
      const collision = await ctx.db
        .query("tags")
        .withIndex("by_author_and_name", (q) =>
          q.eq("authorId", userId).eq("name", name),
        )
        .first();
      if (collision) throw errors.invalidInput("Tag already exists");
    }

    await ctx.db.patch("tags", args.id, { name });
  },
});

export const deleteTag = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertTagOwner(ctx, args.id, userId);
    await cascadeDeleteTag(ctx, args.id);
  },
});

export const createAndAssignTag = mutation({
  args: {
    noteId: v.id("notes"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Tag name is required");

    const existing = await ctx.db
      .query("tags")
      .withIndex("by_author_and_name", (q) =>
        q.eq("authorId", userId).eq("name", name),
      )
      .first();

    const tagId =
      existing?._id ??
      (await ctx.db.insert("tags", {
        authorId: userId,
        name,
        color: args.color,
      }));

    const existingLink = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", args.noteId).eq("tagId", tagId),
      )
      .first();
    if (!existingLink) {
      await ctx.db.insert("noteTags", {
        authorId: userId,
        noteId: args.noteId,
        tagId,
      });
    }

    return tagId;
  },
});

export const assignTagToNote = mutation({
  args: { noteId: v.id("notes"), tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);
    await assertTagOwner(ctx, args.tagId, userId);

    const existing = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", args.noteId).eq("tagId", args.tagId),
      )
      .first();
    if (existing) return;

    await ctx.db.insert("noteTags", {
      authorId: userId,
      noteId: args.noteId,
      tagId: args.tagId,
    });
  },
});

export const unassignTagFromNote = mutation({
  args: { noteId: v.id("notes"), tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const link = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", args.noteId).eq("tagId", args.tagId),
      )
      .first();
    if (!link) return;
    if (link.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.delete("noteTags", link._id);
  },
});

export const listTagsForNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);

    const links = await ctx.db
      .query("noteTags")
      .withIndex("by_note_id", (q) => q.eq("noteId", args.noteId))
      .collect();

    const tags = await Promise.all(
      links.map((link) => ctx.db.get("tags", link.tagId)),
    );

    return tags.filter((t): t is NonNullable<typeof t> => t !== null);
  },
});

export const listAllNoteTagLinks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("noteTags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .take(2000);
  },
});
