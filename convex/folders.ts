import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { errors } from "./_shared/errors";

export const listFolders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    return await ctx.db
      .query("folders")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .order("asc")
      .collect();
  },
});

export const createFolder = mutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const folder = await ctx.db.get("folders", args.id);
    if (!folder) throw errors.notFound("Folder");
    if (folder.authorId !== userId) throw errors.notAuthorized();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const folder = await ctx.db.get("folders", args.id);
    if (!folder) throw errors.notFound("Folder");
    if (folder.authorId !== userId) throw errors.notAuthorized();

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_author_and_folder", (q) =>
        q.eq("authorId", userId).eq("folderId", args.id),
      )
      .collect();
    for (const note of notes) {
      await ctx.db.patch("notes", note._id, { folderId: undefined });
    }

    await ctx.db.delete("folders", args.id);
  },
});

export const moveNoteToFolder = mutation({
  args: { noteId: v.id("notes"), folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.noteId);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

    const folder = await ctx.db.get("folders", args.folderId);
    if (!folder) throw errors.notFound("Folder");
    if (folder.authorId !== userId) throw errors.notAuthorized();

    await ctx.db.patch("notes", args.noteId, { folderId: args.folderId });
  },
});

export const removeNoteFromFolder = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.noteId);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    const note = await ctx.db.get("notes", args.noteId);
    if (!note) throw errors.notFound("Note");
    if (note.authorId !== userId) throw errors.notAuthorized();

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
