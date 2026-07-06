import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { errors } from "./_shared/errors";
import { requireUserId } from "./model/auth";
import { assertFolderOwner, assertNoteOwner } from "./model/ownership";
import { cascadeDeleteFolder } from "./model/cascade";

export const listFolders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("folders")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("asc")
      .take(500);
  },
});

export const createFolder = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Folder name is required");

    const existing = await ctx.db
      .query("folders")
      .withIndex("by_author_and_name", (q) =>
        q.eq("authorId", userId).eq("name", name),
      )
      .first();
    if (existing) throw errors.invalidInput("Folder already exists");

    return await ctx.db.insert("folders", {
      authorId: userId,
      name,
      color: args.color,
    });
  },
});

export const renameFolder = mutation({
  args: { id: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const folder = await assertFolderOwner(ctx, args.id, userId);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Folder name is required");

    if (name !== folder.name) {
      const collision = await ctx.db
        .query("folders")
        .withIndex("by_author_and_name", (q) =>
          q.eq("authorId", userId).eq("name", name),
        )
        .first();
      if (collision) throw errors.invalidInput("Folder already exists");
    }

    await ctx.db.patch("folders", args.id, { name });
  },
});

export const deleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertFolderOwner(ctx, args.id, userId);
    await cascadeDeleteFolder(ctx, args.id, userId);
  },
});

export const moveNoteToFolder = mutation({
  args: { noteId: v.id("notes"), folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);
    await assertFolderOwner(ctx, args.folderId, userId);
    await ctx.db.patch("notes", args.noteId, { folderId: args.folderId });
  },
});

export const removeNoteFromFolder = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);
    await ctx.db.patch("notes", args.noteId, { folderId: undefined });
  },
});

export const createAndAssignFolder = mutation({
  args: {
    noteId: v.id("notes"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await assertNoteOwner(ctx, args.noteId, userId);

    const name = args.name.trim();
    if (!name) throw errors.invalidInput("Folder name is required");

    const existing = await ctx.db
      .query("folders")
      .withIndex("by_author_and_name", (q) =>
        q.eq("authorId", userId).eq("name", name),
      )
      .first();

    const folderId =
      existing?._id ??
      (await ctx.db.insert("folders", {
        authorId: userId,
        name,
        color: args.color,
      }));

    await ctx.db.patch("notes", args.noteId, { folderId });

    return folderId;
  },
});
