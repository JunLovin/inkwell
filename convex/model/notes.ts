import type { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const MAX_PAGE_SIZE = 500;

export async function listNotesForAuthor(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"notes">[]> {
  return await ctx.db
    .query("notes")
    .withIndex("by_author_id", (q) => q.eq("authorId", userId))
    .order("desc")
    .take(MAX_PAGE_SIZE);
}

export async function listActiveNotes(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"notes">[]> {
  const notes = await listNotesForAuthor(ctx, userId);
  return notes.filter((n) => !n.isDeleted);
}

export async function listArchivedNotesForAuthor(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"notes">[]> {
  const notes = await listNotesForAuthor(ctx, userId);
  return notes.filter((n) => n.isArchived && !n.isDeleted);
}

export async function listDeletedNotesForAuthor(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"notes">[]> {
  const notes = await listNotesForAuthor(ctx, userId);
  return notes.filter((n) => !!n.isDeleted);
}

export async function listFavoriteNotesForAuthor(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"notes">[]> {
  const notes = await listNotesForAuthor(ctx, userId);
  return notes.filter((n) => n.isFavorite && !n.isDeleted);
}

export async function findNoteBySlug(
  ctx: QueryCtx,
  userId: Id<"users">,
  slug: string,
): Promise<Doc<"notes"> | null> {
  return await ctx.db
    .query("notes")
    .withIndex("by_author_and_slug", (q) =>
      q.eq("authorId", userId).eq("slug", slug),
    )
    .first();
}
