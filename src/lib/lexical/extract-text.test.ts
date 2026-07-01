import { describe, expect, it } from "vitest";

import { asJson, heading, list, paragraph } from "./__test-utils__/fixtures";
import { extractTextFromLexicalJSON } from "./extract-text";

const twoTextRunsState = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "hello ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: "normal",
            style: "",
            text: "world",
            type: "text",
            version: 1,
          },
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
  it("concatenates plain text from paragraph children", () => {
    expect(extractTextFromLexicalJSON(twoTextRunsState)).toBe("hello world");
  });

  it("extracts heading text", () => {
    expect(extractTextFromLexicalJSON(asJson(heading(2, "Section")))).toBe(
      "Section",
    );
  });

  it("extracts list item text", () => {
    expect(extractTextFromLexicalJSON(asJson(list(["one", "two"])))).toContain(
      "one",
    );
    expect(extractTextFromLexicalJSON(asJson(list(["one", "two"])))).toContain(
      "two",
    );
  });

  it("returns the paragraph text from a simple fixture", () => {
    expect(extractTextFromLexicalJSON(asJson(paragraph("hi")))).toBe("hi");
  });

  it("returns an empty string for malformed JSON", () => {
    expect(extractTextFromLexicalJSON("not json {}")).toBe("");
  });

  it("returns an empty string for an empty input", () => {
    expect(extractTextFromLexicalJSON("")).toBe("");
  });
});
