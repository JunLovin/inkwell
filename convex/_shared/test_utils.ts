import type { convexTest } from "convex-test";

export type ConvexTestInstance = ReturnType<typeof convexTest>;

export async function seedUser(t: ConvexTestInstance, name = "Test User") {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", { name });
  });
  return {
    userId,
    asUser: t.withIdentity({
      subject: `${userId}|test-session`,
      issuer: "https://test.invalid",
      tokenIdentifier: `test|${userId}`,
    }),
  };
}
