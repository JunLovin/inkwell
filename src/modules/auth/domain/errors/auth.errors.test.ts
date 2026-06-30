import { describe, expect, it } from "vitest";
import { AppError } from "@/core/errors";
import { InvalidCredentialsError, SignUpFailedError } from "./auth.errors";

describe("InvalidCredentialsError", () => {
  it("uses code INVALID_CREDENTIALS", () => {
    expect(new InvalidCredentialsError().code).toBe("INVALID_CREDENTIALS");
  });

  it("has a user-facing message", () => {
    expect(new InvalidCredentialsError().message).toBe(
      "Invalid email or password",
    );
  });

  it("is an AppError", () => {
    expect(new InvalidCredentialsError()).toBeInstanceOf(AppError);
  });
});

describe("SignUpFailedError", () => {
  it("uses code SIGN_UP_FAILED", () => {
    expect(new SignUpFailedError().code).toBe("SIGN_UP_FAILED");
  });

  it("has a user-facing message", () => {
    expect(new SignUpFailedError().message).toBe("Failed to create account");
  });

  it("is an AppError", () => {
    expect(new SignUpFailedError()).toBeInstanceOf(AppError);
  });
});
