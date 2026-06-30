import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test-utils";

vi.mock("@google/genai", () => {
  class GoogleGenAI {
    models = {
      generateContent: async () => ({ text: "gemini-said-hi" }),
    };
  }
  return { GoogleGenAI };
});

const modules = import.meta.glob("./**/*.ts");

const originalKey = process.env.GEMINI_API_KEY;
const originalTestMode = process.env.AI_TEST_MODE;

describe("ai.chat", () => {
  beforeEach(() => {
    delete process.env.AI_TEST_MODE;
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalTestMode === undefined) delete process.env.AI_TEST_MODE;
    else process.env.AI_TEST_MODE = originalTestMode;
  });

  test("throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.action(api.ai.chat, {
        messages: [{ role: "user", parts: [{ text: "hi" }] }],
      }),
    ).rejects.toThrow();
  });

  test("returns the gemini response when configured", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    const out = await asUser.action(api.ai.chat, {
      messages: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    expect(out).toBe("gemini-said-hi");
  });

  test("throws AI_NOT_CONFIGURED when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.action(api.ai.chat, {
        messages: [{ role: "user", parts: [{ text: "hi" }] }],
      }),
    ).rejects.toThrow();
  });

  test("returns canned reply when AI_TEST_MODE is true", async () => {
    process.env.AI_TEST_MODE = "true";
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    const out = await asUser.action(api.ai.chat, {
      messages: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    expect(out).toBe("[stub] reply");
  });
});
