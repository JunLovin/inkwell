import { describe, expect, it } from "vitest";
import type { AttachedNote } from "../entities/chat-message";
import {
  dashboardSuggestions,
  noteSuggestions,
  getSuggestions,
} from "./prompt-suggestions";

describe("prompt suggestions", () => {
  it("exposes the exact dashboard suggestion list", () => {
    expect(dashboardSuggestions).toEqual([
      "Summarize my recent notes",
      "What did I write about last week?",
      "Help me organize my ideas",
    ]);
  });

  it("exposes the exact note suggestion list", () => {
    expect(noteSuggestions).toEqual([
      "Summarize this note",
      "Suggest improvements",
      "Extract action items",
    ]);
  });

  it("exposes suggestions as immutable arrays", () => {
    expect(Object.isFrozen(dashboardSuggestions)).toBe(false);
    expect(dashboardSuggestions.length).toBe(3);
    expect(noteSuggestions.length).toBe(3);
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
