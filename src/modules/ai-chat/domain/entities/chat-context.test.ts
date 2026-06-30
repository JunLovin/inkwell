import { describe, expect, it } from "vitest";
import { dashboardContextId, noteContextId } from "./chat-context";

describe("chat-context", () => {
  it("exposes the dashboard context id", () => {
    expect(dashboardContextId).toBe("dashboard");
  });

  it("builds a note context id from a slug", () => {
    expect(noteContextId("my-note")).toBe("note:my-note");
  });

  it("keeps the slug verbatim, including empty strings", () => {
    expect(noteContextId("")).toBe("note:");
    expect(noteContextId("a/b c")).toBe("note:a/b c");
  });

  it("produces different ids for different slugs", () => {
    expect(noteContextId("a")).not.toBe(noteContextId("b"));
  });
});
