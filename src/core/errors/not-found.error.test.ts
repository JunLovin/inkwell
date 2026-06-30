import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";
import { NotFoundError } from "./not-found.error";

describe("NotFoundError", () => {
  it("uses code NOT_FOUND", () => {
    expect(new NotFoundError("Note").code).toBe("NOT_FOUND");
  });

  it("builds the message from the entity name", () => {
    expect(new NotFoundError("Note").message).toBe("Note not found");
    expect(new NotFoundError("User").message).toBe("User not found");
  });

  it("is an AppError", () => {
    expect(new NotFoundError("Folder")).toBeInstanceOf(AppError);
  });
});
