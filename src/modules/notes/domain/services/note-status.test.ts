import { describe, expect, it } from "vitest";
import { makeNote } from "../../__test-utils__/factories";
import { isActive, isArchived, isDeleted, isFavorite } from "./note-status";

describe("note-status predicates", () => {
  it("isDeleted is true only when isDeleted === true", () => {
    expect(isDeleted(makeNote())).toBe(false);
    expect(isDeleted(makeNote({ isDeleted: false }))).toBe(false);
    expect(isDeleted(makeNote({ isDeleted: true }))).toBe(true);
  });

  it("isArchived is true only when isArchived === true", () => {
    expect(isArchived(makeNote())).toBe(false);
    expect(isArchived(makeNote({ isArchived: true }))).toBe(true);
  });

  it("isFavorite is true only when isFavorite === true", () => {
    expect(isFavorite(makeNote())).toBe(false);
    expect(isFavorite(makeNote({ isFavorite: true }))).toBe(true);
  });

  describe("isActive", () => {
    it("returns true when all status flags are unset/false", () => {
      expect(isActive(makeNote())).toBe(true);
    });

    it("returns false when deleted", () => {
      expect(isActive(makeNote({ isDeleted: true }))).toBe(false);
    });

    it("returns false when archived", () => {
      expect(isActive(makeNote({ isArchived: true }))).toBe(false);
    });

    it("returns false when favorite", () => {
      expect(isActive(makeNote({ isFavorite: true }))).toBe(false);
    });

    it("returns false when any combination of flags is set", () => {
      expect(isActive(makeNote({ isDeleted: true, isArchived: true }))).toBe(
        false,
      );
      expect(isActive(makeNote({ isArchived: true, isFavorite: true }))).toBe(
        false,
      );
    });
  });
});
