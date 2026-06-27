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
});
