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

    const note = {
      authorId: userId,
      slug: `${title.toLowerCase().replace(/\s+/g, "-").substring(0, 5)}`,
      title,
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
