import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { errors } from "./_shared/errors";

export const getUserInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const identity = await ctx.db.get("users", userId);
    if (!identity) throw errors.notFound("User");

    return identity;
  },
});

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const trimmed = args.name.trim();
    if (trimmed.length < 2)
      throw errors.invalidInput("Name must be at least 2 characters");

    await ctx.db.patch("users", userId, { name: trimmed });
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const [notes, folders, tags, noteTags] = await Promise.all([
      ctx.db
        .query("notes")
        .withIndex("by_author_id", (q) => q.eq("authorId", userId))
        .collect(),
      ctx.db
        .query("folders")
        .withIndex("by_author_id", (q) => q.eq("authorId", userId))
        .collect(),
      ctx.db
        .query("tags")
        .withIndex("by_author_id", (q) => q.eq("authorId", userId))
        .collect(),
      ctx.db
        .query("noteTags")
        .withIndex("by_author_id", (q) => q.eq("authorId", userId))
        .collect(),
    ]);

    await Promise.all([
      ...noteTags.map((link) => ctx.db.delete("noteTags", link._id)),
      ...notes.map((note) => ctx.db.delete("notes", note._id)),
      ...folders.map((folder) => ctx.db.delete("folders", folder._id)),
      ...tags.map((tag) => ctx.db.delete("tags", tag._id)),
    ]);

    await ctx.db.delete("users", userId);
  },
});
