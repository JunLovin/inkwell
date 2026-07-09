import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { seedUser } from "./_shared/test_utils";

const generateContentMock = vi.fn(async () => ({ text: "gemini-said-hi" }));

vi.mock("@google/genai", () => {
  class GoogleGenAI {
    models = { generateContent: generateContentMock };
  }
  return { GoogleGenAI };
});

const modules = import.meta.glob("./**/*.ts");

describe("ai.chat", () => {
  beforeEach(() => {
    vi.stubEnv("AI_TEST_MODE", "");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    generateContentMock.mockReset();
    generateContentMock.mockResolvedValue({ text: "gemini-said-hi" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
    vi.stubEnv("GEMINI_API_KEY", "");
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.action(api.ai.chat, {
        messages: [{ role: "user", parts: [{ text: "hi" }] }],
      }),
    ).rejects.toThrow();
  });

  test("returns canned reply when AI_TEST_MODE is true", async () => {
    vi.stubEnv("AI_TEST_MODE", "true");
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    const out = await asUser.action(api.ai.chat, {
      messages: [{ role: "user", parts: [{ text: "hi" }] }],
    });
    expect(out).toBe("[stub] reply");
  });

  test("throws AI_UNAVAILABLE when the provider call fails", async () => {
    generateContentMock.mockRejectedValueOnce(new Error("provider boom"));
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t);
    await expect(
      asUser.action(api.ai.chat, {
        messages: [{ role: "user", parts: [{ text: "hi" }] }],
      }),
    ).rejects.toThrow(/AI service is temporarily unavailable/);
  });
});
