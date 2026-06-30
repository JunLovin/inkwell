import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import { errors } from "./errors";

describe("shared error factory", () => {
  it("builds a NOT_AUTHENTICATED ConvexError", () => {
    const err = errors.notAuthenticated();
    expect(err).toBeInstanceOf(ConvexError);
    expect(err.data).toEqual({
      code: "NOT_AUTHENTICATED",
      message: "Not authenticated",
    });
  });

  it("builds a NOT_AUTHORIZED ConvexError", () => {
    const err = errors.notAuthorized();
    expect(err).toBeInstanceOf(ConvexError);
    expect(err.data).toEqual({
      code: "NOT_AUTHORIZED",
      message: "Not authorized",
    });
  });

  it("builds a NOT_FOUND ConvexError with the entity name", () => {
    const err = errors.notFound("Note");
    expect(err).toBeInstanceOf(ConvexError);
    expect(err.data).toEqual({ code: "NOT_FOUND", message: "Note not found" });
  });

  it("builds an INVALID_INPUT ConvexError with the message", () => {
    const err = errors.invalidInput("Name is required");
    expect(err).toBeInstanceOf(ConvexError);
    expect(err.data).toEqual({
      code: "INVALID_INPUT",
      message: "Name is required",
    });
  });

  it("builds an AI_NOT_CONFIGURED ConvexError", () => {
    const err = errors.aiNotConfigured();
    expect(err).toBeInstanceOf(ConvexError);
    expect(err.data).toEqual({
      code: "AI_NOT_CONFIGURED",
      message: "AI is not configured",
    });
  });
});
