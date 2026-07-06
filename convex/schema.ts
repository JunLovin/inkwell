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
    preview: v.optional(v.string()),
    searchableContent: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    isDeleted: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()),
    isPinned: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_author_id", ["authorId"])
    .index("by_author_and_slug", ["authorId", "slug"])
    .index("by_author_and_folder", ["authorId", "folderId"])
    .index("by_author_and_deleted", ["authorId", "isDeleted"])
    .index("by_author_and_archived", ["authorId", "isArchived"])
    .index("by_author_and_favorite", ["authorId", "isFavorite"])
    .index("by_author_and_pinned", ["authorId", "isPinned"])
    .index("by_deleted_and_updated", ["isDeleted", "updatedAt"])
    .searchIndex("search_content", {
      searchField: "searchableContent",
      filterFields: ["authorId", "isDeleted", "isArchived", "folderId"],
    }),

  folders: defineTable({
    authorId: v.id("users"),
    name: v.string(),
    color: v.string(),
  })
    .index("by_author_id", ["authorId"])
    .index("by_author_and_name", ["authorId", "name"]),

  tags: defineTable({
    authorId: v.id("users"),
    name: v.string(),
    color: v.string(),
  })
    .index("by_author_id", ["authorId"])
    .index("by_author_and_name", ["authorId", "name"]),

  noteTags: defineTable({
    authorId: v.id("users"),
    noteId: v.id("notes"),
    tagId: v.id("tags"),
  })
    .index("by_note_id", ["noteId"])
    .index("by_tag_id", ["tagId"])
    .index("by_note_and_tag", ["noteId", "tagId"])
    .index("by_author_id", ["authorId"]),
});

export default schema;
