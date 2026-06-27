import { describe, expect, it } from "vitest";

import type { Id } from "@/convex/_generated/dataModel";
import type { NoteTagLink } from "../entities/tag";
import { buildNoteTagsIndex, noteMatchesAllTags } from "./note-tag-index";

function makeLink(noteId: string, tagId: string): NoteTagLink {
  return {
    _id: `${noteId}-${tagId}`,
    _creationTime: 0,
    authorId: "u1",
    noteId,
    tagId,
  } as unknown as NoteTagLink;
}

describe("buildNoteTagsIndex", () => {
  it("returns empty map for undefined input", () => {
    expect(buildNoteTagsIndex(undefined).size).toBe(0);
  });

  it("returns empty map for empty input", () => {
    expect(buildNoteTagsIndex([]).size).toBe(0);
  });

  it("groups tag ids by note id", () => {
    const links = [
      makeLink("n1", "t1"),
      makeLink("n1", "t2"),
      makeLink("n2", "t1"),
    ];
    const index = buildNoteTagsIndex(links);

    expect(index.get("n1" as Id<"notes">)).toEqual(["t1", "t2"]);
    expect(index.get("n2" as Id<"notes">)).toEqual(["t1"]);
    expect(index.size).toBe(2);
  });
});

describe("noteMatchesAllTags", () => {
  it("returns true when required list is empty", () => {
    expect(noteMatchesAllTags(undefined, [])).toBe(true);
    expect(noteMatchesAllTags([], [])).toBe(true);
  });

  it("returns false when note has no tags but some are required", () => {
    expect(
      noteMatchesAllTags(undefined, ["t1" as Id<"tags">]),
    ).toBe(false);
    expect(noteMatchesAllTags([], ["t1" as Id<"tags">])).toBe(false);
  });

  it("returns true only when all required tags are present (AND)", () => {
    const ids = ["t1", "t2", "t3"] as Id<"tags">[];
    expect(noteMatchesAllTags(ids, ["t1", "t2"] as Id<"tags">[])).toBe(true);
    expect(noteMatchesAllTags(ids, ["t1", "t4"] as Id<"tags">[])).toBe(false);
  });
});
