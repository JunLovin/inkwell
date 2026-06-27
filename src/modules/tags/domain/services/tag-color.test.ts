import { describe, expect, it } from "vitest";

import {
  TAG_COLORS,
  pickColorFromName,
  tagColorClasses,
  tagSwatchClasses,
} from "./tag-color";

describe("pickColorFromName", () => {
  it("returns a color from the palette", () => {
    expect(TAG_COLORS).toContain(pickColorFromName("anything"));
  });

  it("is deterministic for the same name", () => {
    expect(pickColorFromName("work")).toBe(pickColorFromName("work"));
    expect(pickColorFromName("foo bar")).toBe(pickColorFromName("foo bar"));
  });

  it("returns a stable color for empty input", () => {
    expect(TAG_COLORS).toContain(pickColorFromName(""));
  });
});

describe("tagColorClasses", () => {
  it("returns palette-specific classes for known colors", () => {
    expect(tagColorClasses("emerald")).toContain("emerald");
    expect(tagColorClasses("blue")).toContain("blue");
    expect(tagColorClasses("amber")).toContain("amber");
  });

  it("falls back to emerald for unknown colors", () => {
    expect(tagColorClasses("turquoise")).toBe(tagColorClasses("emerald"));
  });
});

describe("tagSwatchClasses", () => {
  it("returns a swatch class for known colors", () => {
    expect(tagSwatchClasses("red")).toContain("red-400");
  });

  it("falls back for unknown colors", () => {
    expect(tagSwatchClasses("zzz")).toBe(tagSwatchClasses("emerald"));
  });
});
