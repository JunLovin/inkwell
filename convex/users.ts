import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { errors } from "./_shared/errors";
import { requireUserId } from "./model/auth";
import { cascadeDeleteUser } from "./model/cascade";

export const getUserInfo = query({
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const identity = await ctx.db.get("users", userId);
    if (!identity) throw errors.notFound("User");
    return identity;
  },
});

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const trimmed = args.name.trim();
    if (trimmed.length < 2)
      throw errors.invalidInput("Name must be at least 2 characters");
    await ctx.db.patch("users", userId, { name: trimmed });
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    await cascadeDeleteUser(ctx, userId);
  },
});
