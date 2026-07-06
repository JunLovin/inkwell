import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { errors } from "../_shared/errors";

type ReadCtx = QueryCtx | MutationCtx;

export async function assertNoteOwner(
  ctx: ReadCtx,
  id: Id<"notes">,
  userId: Id<"users">,
): Promise<Doc<"notes">> {
  const note = await ctx.db.get("notes", id);
  if (!note) throw errors.notFound("Note");
  if (note.authorId !== userId) throw errors.notAuthorized();
  return note;
}

export async function assertFolderOwner(
  ctx: ReadCtx,
  id: Id<"folders">,
  userId: Id<"users">,
): Promise<Doc<"folders">> {
  const folder = await ctx.db.get("folders", id);
  if (!folder) throw errors.notFound("Folder");
  if (folder.authorId !== userId) throw errors.notAuthorized();
  return folder;
}

export async function assertTagOwner(
  ctx: ReadCtx,
  id: Id<"tags">,
  userId: Id<"users">,
): Promise<Doc<"tags">> {
  const tag = await ctx.db.get("tags", id);
  if (!tag) throw errors.notFound("Tag");
  if (tag.authorId !== userId) throw errors.notAuthorized();
  return tag;
}
