import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  handler: async (_ctx, args) => {
    console.log(args.first, args.second);
  },
});
