import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { errors } from "../_shared/errors";

export type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

export async function requireUserId(ctx: AnyCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw errors.notAuthenticated();
  return userId;
}
