import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getNotes = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { search } = args;
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    if (search) {
      return notes.filter((note) =>
        note.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return notes;
  },
});

export const getNote = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { slug } = args;
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notes = await ctx.db.query("notes").collect();

    const note = notes.filter((n) => n.slug === slug)[0];

    if (!note) {
      throw new Error("Note not found or not authorized");
    }

    return note;
  },
});

export const addNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    preview: v.string()
  },
  handler: async (ctx, args) => {
    const { title, content, preview } = args;
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = {
      authorId: userId,
      title,
      slug: `${title.toLowerCase().replace(/\s+/g, "-")}`,
      preview,
      content,
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
    const { id, title, content, preview } = args;

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get("notes", id);

    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    const updatedNote = {
      ...note,
      title: title ?? note.title,
      content: content ?? note.content,
      preview: preview ?? note.preview,
      updatedAt: Date.now(),
    };

    await ctx.db.patch("notes", id, updatedNote);
  },
});

export const deleteNote = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const { id } = args;

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get("notes", id);

    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", id, { isDeleted: true });
  },
});

export const archiveNote = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const { id } = args;

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get("notes", id);

    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", id, { isArchived: true });
  },
});

export const markNoteAsFavorite = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const { id } = args;

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get("notes", id);

    if (!note || note.authorId !== userId) {
      throw new Error("Note not found or not authorized");
    }

    await ctx.db.patch("notes", id, { isFavorite: true });
  },
});
