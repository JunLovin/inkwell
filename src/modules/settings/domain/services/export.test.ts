import { describe, expect, it } from "vitest";
import type { Note } from "@/modules/notes";
import { makeNote } from "@/modules/notes/__test-utils__/factories";
import {
  DELETE_CONFIRMATION_PHRASE,
  buildExportFilename,
  buildExportPayload,
  isDeleteConfirmed,
  todayStamp,
} from "./export";

const FIXED_NOW = new Date(2024, 0, 5, 10, 30, 0);

describe("todayStamp", () => {
  it("pads month and day to two digits", () => {
    expect(todayStamp(FIXED_NOW)).toBe("2024-01-05");
  });

  it("uses the current date when no argument is passed", () => {
    expect(todayStamp()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("buildExportFilename", () => {
  it("uses the inkwell-export-<date>.json convention", () => {
    expect(buildExportFilename(FIXED_NOW)).toBe(
      "inkwell-export-2024-01-05.json",
    );
  });
});

describe("buildExportPayload", () => {
  it("returns an empty list when notes are undefined", () => {
    const payload = buildExportPayload(undefined, FIXED_NOW);
    expect(payload).toEqual({
      exportedAt: FIXED_NOW.toISOString(),
      noteCount: 0,
      notes: [],
    });
  });

  it("includes the supplied notes and counts them", () => {
    const notes: Note[] = [makeNote({ slug: "a" }), makeNote({ slug: "b" })];
    const payload = buildExportPayload(notes, FIXED_NOW);
    expect(payload.noteCount).toBe(2);
    expect(payload.notes).toBe(notes);
    expect(payload.exportedAt).toBe(FIXED_NOW.toISOString());
  });
});

describe("isDeleteConfirmed", () => {
  it("returns true only for the exact phrase", () => {
    expect(isDeleteConfirmed(DELETE_CONFIRMATION_PHRASE)).toBe(true);
  });

  it("is case-sensitive", () => {
    expect(isDeleteConfirmed("delete")).toBe(false);
    expect(isDeleteConfirmed("Delete")).toBe(false);
  });

  it("rejects empty / whitespace / partial input", () => {
    expect(isDeleteConfirmed("")).toBe(false);
    expect(isDeleteConfirmed(" DELETE ")).toBe(false);
    expect(isDeleteConfirmed("DELET")).toBe(false);
  });
});
