import { describe, expect, it } from "vitest";

import { generateSlug } from "./note-slug";

const SUFFIX = /-[a-z0-9]{6}$/;

function base(slug: string): string {
  return slug.replace(SUFFIX, "");
}

describe("generateSlug", () => {
  it("lowercases and joins words with dashes", () => {
    const slug = generateSlug("My First Note");
    expect(base(slug)).toBe("my-first-note");
    expect(slug).toMatch(SUFFIX);
  });

  it("collapses runs of whitespace", () => {
    expect(base(generateSlug("Hello    world"))).toBe("hello-world");
  });

  it("trims leading and trailing whitespace before slugifying", () => {
    expect(base(generateSlug("   spaced   "))).toBe("spaced");
  });

  it("strips characters outside [a-z0-9-]", () => {
    expect(base(generateSlug("Hello, World! 123"))).toBe("hello-world-123");
  });

  it("falls back to 'note' when input has no slug-safe characters", () => {
    expect(base(generateSlug("!!!"))).toBe("note");
  });

  it("preserves digits", () => {
    expect(base(generateSlug("note 42"))).toBe("note-42");
  });

  it("strips accented characters (no transliteration)", () => {
    expect(base(generateSlug("Café écolier"))).toBe("caf-colier");
  });

  it("falls back to 'note' for non-ascii-only input", () => {
    expect(base(generateSlug("日本語"))).toBe("note");
  });

  it("strips surrounding punctuation and returns the trimmed slug", () => {
    expect(base(generateSlug("!hello!"))).toBe("hello");
  });

  it("collapses leading dashes produced by punctuation", () => {
    expect(base(generateSlug(". hello"))).toBe("hello");
  });

  it("falls back to 'note' for whitespace-only input", () => {
    expect(base(generateSlug("   "))).toBe("note");
  });

  it("produces different suffixes across calls with the same title", () => {
    const a = generateSlug("Same title");
    const b = generateSlug("Same title");
    expect(a).not.toBe(b);
  });
});
