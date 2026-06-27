import { describe, expect, it } from "vitest";

import {
  buildSearchableContent,
  extractTextFromLexicalJSON,
} from "./lexicalText";

const validEditorState = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "hello " },
          { type: "text", text: "world" },
        ],
      },
      {
        type: "heading",
        children: [{ type: "text", text: "second line" }],
      },
    ],
    type: "root",
  },
});

describe("extractTextFromLexicalJSON (server)", () => {
  it("concatenates text from all nested nodes", () => {
    expect(extractTextFromLexicalJSON(validEditorState)).toBe(
      "hello world second line",
    );
  });

  it("returns empty string for undefined input", () => {
    expect(extractTextFromLexicalJSON(undefined)).toBe("");
  });

  it("returns empty string for malformed JSON", () => {
    expect(extractTextFromLexicalJSON("not json")).toBe("");
  });

  it("collapses repeated whitespace", () => {
    const state = JSON.stringify({
      root: {
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "a\n\n\nb   c" }],
          },
        ],
      },
    });
    expect(extractTextFromLexicalJSON(state)).toBe("a b c");
  });
});

describe("buildSearchableContent", () => {
  it("prepends the title before the extracted body", () => {
    expect(buildSearchableContent("My Note", validEditorState)).toBe(
      "My Note hello world second line",
    );
  });

  it("returns just the title when content is empty", () => {
    expect(buildSearchableContent("Just a title", undefined)).toBe(
      "Just a title",
    );
    expect(buildSearchableContent("Just a title", "")).toBe("Just a title");
  });
});
