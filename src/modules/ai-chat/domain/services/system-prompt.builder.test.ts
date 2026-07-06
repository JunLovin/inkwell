import { describe, expect, it } from "vitest";

import { buildSystemPrompt } from "./system-prompt.builder";

describe("buildSystemPrompt", () => {
  it("returns the free-tier prompt when no note is attached", () => {
    const prompt = buildSystemPrompt(null);
    expect(prompt).toContain("Inkwell Assistant");
    expect(prompt).not.toContain("shared a note");
  });

  it("inlines the attached note content with a delimiter block", () => {
    const prompt = buildSystemPrompt({
      id: "n1",
      title: "Trip plan",
      slug: "trip-plan",
      plainText: "Day 1: arrive\nDay 2: hike",
    });

    expect(prompt).toContain("Inkwell Assistant");
    expect(prompt).toContain("shared a note");
    expect(prompt).toContain("Day 1: arrive");
    expect(prompt).toContain("Day 2: hike");
    expect(prompt).toContain("---");
  });

  it("returns writer-mode instructions when mode is 'writer'", () => {
    const prompt = buildSystemPrompt(
      {
        id: "n1",
        title: "Story draft",
        slug: "story-draft",
        plainText: "Once upon a time",
      },
      "writer",
    );
    expect(prompt).toContain("WRITER mode");
    expect(prompt).toContain("Story draft");
    expect(prompt).toContain("Once upon a time");
    expect(prompt).toContain("ONLY the markdown");
  });

  it("falls back to the free prompt when no note is attached even in writer mode", () => {
    const prompt = buildSystemPrompt(null, "writer");
    expect(prompt).not.toContain("WRITER mode");
  });
});
