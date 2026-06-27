import { describe, expect, it } from "vitest";

import {
  FOLDER_COLORS,
  folderBadgeClasses,
  folderIconClasses,
  pickFolderColor,
} from "./folder-color";

describe("pickFolderColor", () => {
  it("returns a color from the palette", () => {
    expect(FOLDER_COLORS).toContain(pickFolderColor("Work"));
  });

  it("is deterministic for the same name", () => {
    expect(pickFolderColor("Inbox")).toBe(pickFolderColor("Inbox"));
  });
});

describe("folderIconClasses", () => {
  it("returns palette class for known color", () => {
    expect(folderIconClasses("blue")).toContain("blue-400");
  });

  it("falls back to emerald for unknown color", () => {
    expect(folderIconClasses("zzz")).toBe(folderIconClasses("emerald"));
  });
});

describe("folderBadgeClasses", () => {
  it("returns badge class for known color", () => {
    expect(folderBadgeClasses("amber")).toContain("amber");
  });

  it("falls back for unknown color", () => {
    expect(folderBadgeClasses("xyz")).toBe(folderBadgeClasses("emerald"));
  });
});
