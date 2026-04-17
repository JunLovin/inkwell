import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

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
