import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";
import { NotAuthenticatedError } from "./not-authenticated.error";

describe("NotAuthenticatedError", () => {
  it("uses code NOT_AUTHENTICATED", () => {
    expect(new NotAuthenticatedError().code).toBe("NOT_AUTHENTICATED");
  });

  it("defaults to a sensible message", () => {
    expect(new NotAuthenticatedError().message).toBe("Not authenticated");
  });

  it("accepts a custom message", () => {
    expect(new NotAuthenticatedError("Session expired").message).toBe(
      "Session expired",
    );
  });

  it("is an AppError", () => {
    expect(new NotAuthenticatedError()).toBeInstanceOf(AppError);
  });
});
