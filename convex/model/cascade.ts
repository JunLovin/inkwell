import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function cascadeDeleteNote(
  ctx: MutationCtx,
  noteId: Id<"notes">,
): Promise<void> {
  const links = await ctx.db
    .query("noteTags")
    .withIndex("by_note_id", (q) => q.eq("noteId", noteId))
    .collect();
  await Promise.all(links.map((link) => ctx.db.delete("noteTags", link._id)));
  await ctx.db.delete("notes", noteId);
}

export async function cascadeDeleteFolder(
  ctx: MutationCtx,
  folderId: Id<"folders">,
  userId: Id<"users">,
): Promise<void> {
  const notes = await ctx.db
    .query("notes")
    .withIndex("by_author_and_folder", (q) =>
      q.eq("authorId", userId).eq("folderId", folderId),
    )
    .collect();
  for (const note of notes) {
    await ctx.db.patch("notes", note._id, { folderId: undefined });
  }
  await ctx.db.delete("folders", folderId);
}

export async function cascadeDeleteTag(
  ctx: MutationCtx,
  tagId: Id<"tags">,
): Promise<void> {
  const links = await ctx.db
    .query("noteTags")
    .withIndex("by_tag_id", (q) => q.eq("tagId", tagId))
    .collect();
  await Promise.all(links.map((link) => ctx.db.delete("noteTags", link._id)));
  await ctx.db.delete("tags", tagId);
}

export async function cascadeDeleteUser(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const [notes, folders, tags, noteTags] = await Promise.all([
    ctx.db
      .query("notes")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect(),
    ctx.db
      .query("folders")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect(),
    ctx.db
      .query("tags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect(),
    ctx.db
      .query("noteTags")
      .withIndex("by_author_id", (q) => q.eq("authorId", userId))
      .collect(),
  ]);

  await Promise.all([
    ...noteTags.map((link) => ctx.db.delete("noteTags", link._id)),
    ...notes.map((note) => ctx.db.delete("notes", note._id)),
    ...folders.map((folder) => ctx.db.delete("folders", folder._id)),
    ...tags.map((tag) => ctx.db.delete("tags", tag._id)),
  ]);

  await ctx.db.delete("users", userId);
}
