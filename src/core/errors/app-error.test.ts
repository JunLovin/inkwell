import { describe, expect, it } from "vitest";
import { AppError } from "./app-error";

describe("AppError", () => {
  it("extends Error", () => {
    const err = new AppError("CODE", "message");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("exposes code and message", () => {
    const err = new AppError("SOME_CODE", "something went wrong");
    expect(err.code).toBe("SOME_CODE");
    expect(err.message).toBe("something went wrong");
  });

  it("sets name to the constructor name", () => {
    const err = new AppError("X", "y");
    expect(err.name).toBe("AppError");
  });

  it("preserves name for subclasses", () => {
    class CustomError extends AppError {
      constructor() {
        super("CUSTOM", "custom");
      }
    }
    const err = new CustomError();
    expect(err.name).toBe("CustomError");
    expect(err).toBeInstanceOf(AppError);
  });
});
