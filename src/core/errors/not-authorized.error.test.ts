import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";
import { NotAuthorizedError } from "./not-authorized.error";

describe("NotAuthorizedError", () => {
  it("uses code NOT_AUTHORIZED", () => {
    expect(new NotAuthorizedError().code).toBe("NOT_AUTHORIZED");
  });

  it("defaults to a sensible message", () => {
    expect(new NotAuthorizedError().message).toBe("Not authorized");
  });

  it("accepts a custom message", () => {
    expect(new NotAuthorizedError("Forbidden resource").message).toBe(
      "Forbidden resource",
    );
  });

  it("is an AppError", () => {
    expect(new NotAuthorizedError()).toBeInstanceOf(AppError);
  });
});
