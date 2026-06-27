import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { errors } from "./_shared/errors";
import { buildSearchableContent } from "./_shared/lexicalText";

export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    return await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});

export const getNote = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db
      .query("notes")
      .withIndex("by_author_and_slug", (q) =>
        q.eq("authorId", userId).eq("slug", args.slug),
      )
      .first();

    if (!note) throw errors.notFound("Note");

    return note;
  },
});

export const addNote = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    preview: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const now = Date.now();
    const note = {
      authorId: userId,
      title: args.title,
      slug: args.slug,
      preview: args.preview,
      content: args.content,
      searchableContent: buildSearchableContent(args.title, args.content),
      isDeleted: false,
      isArchived: false,
      isFavorite: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    const nextTitle = args.title ?? note.title;
    const nextContent = args.content ?? note.content;

    await ctx.db.patch("notes", args.id, {
      title: nextTitle,
      content: nextContent,
      preview: args.preview ?? note.preview,
      searchableContent: buildSearchableContent(nextTitle, nextContent),
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isDeleted: true });
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isArchived: true });
  },
});

export const markNoteAsFavorite = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isFavorite: true });
  },
});

export const pinNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isPinned: true });
  },
});

export const unpinNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isPinned: false });
  },
});

export const removeFavoriteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, { isFavorite: false });
  },
});

export const getArchivedNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
    return notes.filter((n) => n.isArchived && !n.isDeleted);
  },
});

export const restoreNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.id);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.id, {
      isArchived: false,
      updatedAt: Date.now(),
    });
  },
});

export const bulkArchiveNotes = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    for (const id of args.ids) {
      const note = await ctx.db.get("notes", id);
      if (!note || note.authorId !== userId) continue;
      await ctx.db.patch("notes", id, { isArchived: true });
    }
  },
});

export const bulkDeleteNotes = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    for (const id of args.ids) {
      const note = await ctx.db.get("notes", id);
      if (!note || note.authorId !== userId) continue;
      await ctx.db.patch("notes", id, { isDeleted: true });
    }
  },
});

export const searchNotes = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const trimmed = args.search.trim();
    if (!trimmed) return [];

    const results = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("searchableContent", trimmed).eq("authorId", userId),
      )
      .take(50);

    return results.filter((n) => !n.isDeleted);
  },
});

export const getFavoriteNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
    return notes.filter((n) => n.isFavorite && !n.isDeleted);
  },
});
