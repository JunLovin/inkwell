import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { errors } from "./_shared/errors";

export const getUserInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const identity = await ctx.db.get("users", userId);
    if (!identity) throw errors.notAuthenticated();

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

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect();

    for (const note of notes) {
      await ctx.db.delete("notes", note._id);
    }

    await ctx.db.delete("users", userId);
  },
});
