import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { errors } from "./_shared/errors";
import { buildSearchableContent } from "./_shared/lexicalText";
import { requireUserId } from "./model/auth";
import { assertNoteOwner } from "./model/ownership";
import { cascadeDeleteNote } from "./model/cascade";
import { LIMITS, assertMaxLength } from "./_shared/validation";
import {
  findNoteBySlug,
  listActiveNotes,
  listArchivedNotesForAuthor,
  listDeletedNotesForAuthor,
  listFavoriteNotesForAuthor,
} from "./model/notes";

const MAX_BULK_IDS = 100;
const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await listActiveNotes(ctx, userId);
  },
});

export const getNoteBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await findNoteBySlug(ctx, userId, args.slug);
  },
});

export const listArchivedNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await listArchivedNotesForAuthor(ctx, userId);
  },
});

export const listDeletedNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await listDeletedNotesForAuthor(ctx, userId);
  },
});

export const listFavoriteNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await listFavoriteNotesForAuthor(ctx, userId);
  },
});

export const searchNotes = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const trimmed = args.search.trim();
    if (!trimmed) return [];

    const hits = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("searchableContent", trimmed).eq("authorId", userId),
      )
      .take(50);

    return hits.filter((n) => !n.isDeleted);
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    preview: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    assertMaxLength("Title", args.title, LIMITS.noteTitle);
    assertMaxLength("Slug", args.slug, LIMITS.noteSlug);
    assertMaxLength("Preview", args.preview, LIMITS.notePreview);
    assertMaxLength("Content", args.content, LIMITS.noteContent);
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
    const userId = await requireUserId(ctx);
    const note = await assertNoteOwner(ctx, args.id, userId);

    if (args.title !== undefined)
      assertMaxLength("Title", args.title, LIMITS.noteTitle);
    if (args.content !== undefined)
      assertMaxLength("Content", args.content, LIMITS.noteContent);
    if (args.preview !== undefined)
      assertMaxLength("Preview", args.preview, LIMITS.notePreview);

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
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

export const purgeNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await cascadeDeleteNote(ctx, args.id);
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

export const favoriteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isFavorite: true,
      updatedAt: Date.now(),
    });
  },
});

export const unfavoriteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isFavorite: false,
      updatedAt: Date.now(),
    });
  },
});

export const pinNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isPinned: true,
      updatedAt: Date.now(),
    });
  },
});

export const unpinNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isPinned: false,
      updatedAt: Date.now(),
    });
  },
});

export const restoreNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.id, userId);
    await ctx.db.patch("notes", args.id, {
      isArchived: false,
      isDeleted: false,
      updatedAt: Date.now(),
    });
  },
});

function assertBulkSize(ids: readonly unknown[]) {
  if (ids.length === 0)
    throw errors.invalidInput("At least one id is required");
  if (ids.length > MAX_BULK_IDS)
    throw errors.invalidInput(`Too many ids (max ${MAX_BULK_IDS} per call)`);
}

export const bulkArchiveNotes = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    assertBulkSize(args.ids);

    const now = Date.now();
    for (const id of args.ids) {
      await assertNoteOwner(ctx, id, userId);
      await ctx.db.patch("notes", id, { isArchived: true, updatedAt: now });
    }
    return { processed: args.ids.length, skipped: 0 };
  },
});

export const bulkDeleteNotes = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    assertBulkSize(args.ids);

    const now = Date.now();
    for (const id of args.ids) {
      await assertNoteOwner(ctx, id, userId);
      await ctx.db.patch("notes", id, { isDeleted: true, updatedAt: now });
    }
    return { processed: args.ids.length, skipped: 0 };
  },
});

export const bulkPurgeNotes = mutation({
  args: { ids: v.array(v.id("notes")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    assertBulkSize(args.ids);

    for (const id of args.ids) {
      await assertNoteOwner(ctx, id, userId);
      await cascadeDeleteNote(ctx, id);
    }
    return { processed: args.ids.length, skipped: 0 };
  },
});

export const purgeOldTrash = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - TRASH_RETENTION_MS;
    const stale = await ctx.db
      .query("notes")
      .withIndex("by_deleted_and_updated", (q) =>
        q.eq("isDeleted", true).lt("updatedAt", cutoff),
      )
      .take(200);

    for (const note of stale) {
      await cascadeDeleteNote(ctx, note._id);
    }
    return { purged: stale.length };
  },
});
