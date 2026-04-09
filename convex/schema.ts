import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  notes: defineTable({
    authorId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    isDeleted: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  }).index("by_author_id", ["authorId"]),
});

export default schema;
