import { internalMutation } from "../_generated/server";

export const normalizeNoteFlags = internalMutation({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    let patched = 0;
    for (const note of notes) {
      const patch: Record<string, boolean | number> = {};
      if (note.isDeleted === undefined) patch.isDeleted = false;
      if (note.isArchived === undefined) patch.isArchived = false;
      if (note.isFavorite === undefined) patch.isFavorite = false;
      if (note.isPinned === undefined) patch.isPinned = false;
      if (note.createdAt === undefined) {
        patch.createdAt = note.updatedAt ?? note._creationTime;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch("notes", note._id, patch);
        patched += 1;
      }
    }
    return { patched, scanned: notes.length };
  },
});
