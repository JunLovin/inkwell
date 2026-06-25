import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});

export const getNote = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    if (!note) throw new Error("Note not found or not authorized");

    return note;
  },
});

export const addNote = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    preview: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = {
      authorId: userId,
      title: args.title,
      slug: args.slug,
      preview: args.preview,
      content: args.content,
      isDeleted: false,
      isArchived: false,
      isFavorite: false,
      updatedAt: Date.now(),
    };

    const id = await ctx.db.insert("notes", note);
    return { id, ...note };
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", args.id, {
      title: args.title ?? note.title,
      content: args.content ?? note.content,
      preview: args.preview ?? note.preview,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", args.id, { isDeleted: true });
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", args.id, { isArchived: true });
  },
});

export const markNoteAsFavorite = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", args.id, { isFavorite: true });
  },
});

export const removeFavoriteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.patch("notes", args.id, { isFavorite: false });
  },
});

export const getArchivedNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
    return notes.filter((n) => n.isArchived && !n.isDeleted);
  },
});

export const restoreNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get("notes", args.id);
    if (!note || note.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.patch("notes", args.id, {
      isArchived: false,
      updatedAt: Date.now(),
    });
  },
});

export const getFavoriteNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
    return notes.filter((n) => n.isFavorite && !n.isDeleted);
  },
});
