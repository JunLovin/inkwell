import { describe, expect, it } from "vitest";
import type { AttachedNote } from "../entities/chat-message";
import {
  dashboardSuggestions,
  noteSuggestions,
  getSuggestions,
} from "./prompt-suggestions";

describe("prompt suggestions", () => {
  it("exposes non-empty dashboard suggestions", () => {
    expect(dashboardSuggestions.length).toBeGreaterThan(0);
    dashboardSuggestions.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("exposes non-empty note suggestions", () => {
    expect(noteSuggestions.length).toBeGreaterThan(0);
    noteSuggestions.forEach((s) => expect(typeof s).toBe("string"));
  });

  describe("getSuggestions", () => {
    it("returns dashboard suggestions when no note is attached", () => {
      expect(getSuggestions(null)).toBe(dashboardSuggestions);
    });

    it("returns note suggestions when a note is attached", () => {
      const note: AttachedNote = {
        id: "n",
        title: "t",
        slug: "s",
        plainText: "p",
      };
      expect(getSuggestions(note)).toBe(noteSuggestions);
    });
  });
});
