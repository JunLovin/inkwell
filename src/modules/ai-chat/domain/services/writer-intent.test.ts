import { describe, expect, it } from "vitest";

import { isWriterIntent } from "./writer-intent";

describe("isWriterIntent", () => {
  it("detects English writer verbs at the start of the prompt", () => {
    expect(isWriterIntent("Write about mitochondria")).toBe(true);
    expect(isWriterIntent("Draft a summary")).toBe(true);
    expect(isWriterIntent("Generate 3 ideas")).toBe(true);
    expect(isWriterIntent("Outline the plan")).toBe(true);
    expect(isWriterIntent("Compose a poem")).toBe(true);
  });

  it("detects Spanish writer verbs at the start of the prompt", () => {
    expect(isWriterIntent("Escribe sobre el mar")).toBe(true);
    expect(isWriterIntent("Redacta un párrafo")).toBe(true);
    expect(isWriterIntent("Genera 3 ideas")).toBe(true);
  });

  it("ignores writer verbs that are not at the start", () => {
    expect(isWriterIntent("How do I write about X?")).toBe(false);
    expect(isWriterIntent("Please generate ideas")).toBe(false);
  });

  it("returns false for chat-style prompts", () => {
    expect(isWriterIntent("What is markdown?")).toBe(false);
    expect(isWriterIntent("Summarize this note")).toBe(false);
    expect(isWriterIntent("")).toBe(false);
    expect(isWriterIntent("   ")).toBe(false);
  });

  it("is case-insensitive and tolerant of punctuation", () => {
    expect(isWriterIntent("WRITE about ants")).toBe(true);
    expect(isWriterIntent("write, about ants")).toBe(true);
    expect(isWriterIntent("draft: a summary")).toBe(true);
  });
});
