import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// TODO: Improve this file separating concerns and changing the name of the functions

// INFO: Notes

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

export const addNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { title, content } = args;
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    let preview: string = content;

    if (content.length > 150) {
      preview = content.substring(0, 150);
    }

    const note = {
      authorId: userId,
      title,
      slug: `${title.toLowerCase().replace(/\s+/g, "-").substring(0, 5)}`,
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

// INFO: Auth

export const getUserInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const identity = await ctx.db.get("users", userId);

    if (!identity) {
      throw new Error("Not authenticated");
    }

    return identity;
  },
});
