import { describe, expect, it } from "vitest";
import { jsonToMarkdown } from "./json-to-markdown";

const makeParagraph = (text: string) => ({
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            version: 1,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text,
          },
        ],
      },
    ],
  },
});

const makeHeading = (text: string) => ({
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [
      {
        type: "heading",
        tag: "h1",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            version: 1,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text,
          },
        ],
      },
    ],
  },
});

describe("jsonToMarkdown", () => {
  it("converts a paragraph to plain markdown", () => {
    const json = JSON.stringify(makeParagraph("Hello world"));
    expect(jsonToMarkdown(json)).toContain("Hello world");
  });

  it("converts a heading to a markdown heading", () => {
    const json = JSON.stringify(makeHeading("Title"));
    const md = jsonToMarkdown(json);
    expect(md).toMatch(/^# Title/m);
  });

  it("throws on malformed JSON", () => {
    expect(() => jsonToMarkdown("not-json")).toThrow();
  });
});
