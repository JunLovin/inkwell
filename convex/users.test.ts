import { describe, expect, test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test_utils";

const modules = import.meta.glob("./**/*.ts");

describe("users auth guards", () => {
  test("getUserInfo throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.users.getUserInfo, {})).rejects.toThrow();
  });

  test("updateProfile throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.users.updateProfile, { name: "New" }),
    ).rejects.toThrow();
  });

  test("deleteAccount throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.users.deleteAccount, {})).rejects.toThrow();
  });
});

describe("getUserInfo", () => {
  test("returns the authenticated user", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "Alice");
    const user = await asUser.query(api.users.getUserInfo, {});
    expect(user.name).toBe("Alice");
  });
});

describe("updateProfile", () => {
  test("trims and updates the name", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "old");
    await asUser.mutation(api.users.updateProfile, { name: "  New Name  " });
    const user = await asUser.query(api.users.getUserInfo, {});
    expect(user.name).toBe("New Name");
  });

  test("rejects names shorter than 2 chars", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.mutation(api.users.updateProfile, { name: "a" }),
    ).rejects.toThrow();
    await expect(
      asUser.mutation(api.users.updateProfile, { name: "   " }),
    ).rejects.toThrow();
  });
});

describe("deleteAccount", () => {
  test("deletes the user and their notes", async () => {
    const t = convexTest(schema, modules);
    const { userId, asUser } = await seedUser(t);
    await asUser.mutation(api.notes.createNote, {
      title: "t",
      slug: "s",
      content: "{}",
      preview: "",
    });
    await asUser.mutation(api.users.deleteAccount, {});
    const lookups = await t.run(async (ctx) => {
      const u = await ctx.db.get(userId);
      const remainingNotes = await ctx.db
        .query("notes")
        .withIndex("by_author_id", (q) => q.eq("authorId", userId))
        .collect();
      return { user: u, remainingNotes };
    });
    expect(lookups.user).toBeNull();
    expect(lookups.remainingNotes).toEqual([]);
  });
});
