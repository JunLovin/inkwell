import { describe, expect, it } from "vitest";

import { generateSlug } from "./note-slug";

describe("generateSlug", () => {
  it("lowercases and joins words with dashes", () => {
    expect(generateSlug("My First Note")).toBe("my-first-note");
  });

  it("collapses runs of whitespace", () => {
    expect(generateSlug("Hello    world")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace before slugifying", () => {
    expect(generateSlug("   spaced   ")).toBe("spaced");
  });

  it("strips characters outside [a-z0-9-]", () => {
    expect(generateSlug("Hello, World! 123")).toBe("hello-world-123");
  });

  it("returns an empty string when input has no slug-safe characters", () => {
    expect(generateSlug("!!!")).toBe("");
  });

  it("preserves digits", () => {
    expect(generateSlug("note 42")).toBe("note-42");
  });

  it("strips accented characters (no transliteration)", () => {
    expect(generateSlug("Café écolier")).toBe("caf-colier");
  });

  it("strips non-ascii letters entirely", () => {
    expect(generateSlug("日本語 note")).toBe("-note");
  });

  it("strips surrounding punctuation entirely", () => {
    expect(generateSlug("!hello!")).toBe("hello");
  });

  it("may produce a leading dash when punctuation is followed by whitespace", () => {
    expect(generateSlug(". hello")).toBe("-hello");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(generateSlug("   ")).toBe("");
  });
});
