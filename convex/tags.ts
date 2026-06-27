import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { errors } from "./_shared/errors";

export const listTags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    return await ctx.db
      .query("tags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("asc")
      .collect();
  },
});

export const createTag = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Tag name is required");

    const existing = await ctx.db
      .query("tags")
      .withIndex("by_author_and_name", (q) =>
        q.eq("authorId", userId).eq("name", name),
      )
      .first();
    if (existing) throw errors.invalidInput("Tag already exists");

    const id = await ctx.db.insert("tags", {
      authorId: userId,
      name,
      color: args.color,
    });
    return id;
  },
});

export const renameTag = mutation({
  args: { id: v.id("tags"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const tag = await ctx.db.get("tags", args.id);
    if (!tag) throw errors.notFound("Tag");
    if (tag.authorId !== userId) throw errors.notAuthorized();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const tag = await ctx.db.get("tags", args.id);
    if (!tag) throw errors.notFound("Tag");
    if (tag.authorId !== userId) throw errors.notAuthorized();

    const links = await ctx.db
      .query("noteTags")
      .withIndex("by_tag_id", (q) => q.eq("tagId", args.id))
      .collect();
    for (const link of links) {
      await ctx.db.delete("noteTags", link._id);
    }

    await ctx.db.delete("tags", args.id);
  },
});

export const assignTagToNote = mutation({
  args: { noteId: v.id("notes"), tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.noteId);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    const tag = await ctx.db.get("tags", args.tagId);
    if (!tag) throw errors.notFound("Tag");
    if (tag.authorId !== userId) throw errors.notAuthorized();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const links = await ctx.db
      .query("noteTags")
      .withIndex("by_note_id", (q) => q.eq("noteId", args.noteId))
      .collect();

    const tags = await Promise.all(
      links.map((link) => ctx.db.get("tags", link.tagId)),
    );

    return tags
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .filter((t) => t.authorId === userId);
  },
});

export const listAllNoteTagLinks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    return await ctx.db
      .query("noteTags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect();
  },
});
