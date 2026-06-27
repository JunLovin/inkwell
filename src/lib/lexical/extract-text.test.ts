import { describe, expect, it } from "vitest";

import { extractTextFromLexicalJSON } from "./extract-text";

const validEditorState = JSON.stringify({
  root: {
    children: [
      {
        children: [
          { detail: 0, format: 0, mode: "normal", style: "", text: "hello ", type: "text", version: 1 },
          { detail: 0, format: 1, mode: "normal", style: "", text: "world", type: "text", version: 1 },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
        textFormat: 0,
        textStyle: "",
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

describe("extractTextFromLexicalJSON", () => {
  it("returns the concatenated plain text of the editor state", () => {
    expect(extractTextFromLexicalJSON(validEditorState)).toBe("hello world");
  });

  it("returns an empty string for malformed JSON", () => {
    expect(extractTextFromLexicalJSON("not json {}")).toBe("");
  });

  it("returns an empty string for an empty input", () => {
    expect(extractTextFromLexicalJSON("")).toBe("");
  });
});
