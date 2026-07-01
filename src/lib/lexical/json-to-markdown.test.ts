import { describe, expect, it } from "vitest";
import { asJson, heading, list, paragraph } from "./__test-utils__/fixtures";
import { jsonToMarkdown } from "./json-to-markdown";

describe("jsonToMarkdown", () => {
  it("converts a paragraph to plain markdown", () => {
    expect(jsonToMarkdown(asJson(paragraph("Hello world")))).toContain(
      "Hello world",
    );
  });

  it("converts an H1 heading to a markdown heading", () => {
    expect(jsonToMarkdown(asJson(heading(1, "Title")))).toMatch(/^# Title/m);
  });

  it("converts an unordered list to bullet markdown", () => {
    const md = jsonToMarkdown(asJson(list(["one", "two"])));
    expect(md).toMatch(/^- one/m);
    expect(md).toMatch(/^- two/m);
  });

  it("converts an ordered list to numbered markdown", () => {
    const md = jsonToMarkdown(asJson(list(["one", "two"], true)));
    expect(md).toMatch(/^1\. one/m);
    expect(md).toMatch(/^2\. two/m);
  });

  it("throws on malformed JSON", () => {
    expect(() => jsonToMarkdown("not-json")).toThrow();
  });
});
