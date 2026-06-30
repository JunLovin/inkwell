import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "./reset-password.schema";

const valid = {
  email: "a@b.com",
  code: "123456",
  newPassword: "newpass1",
  confirmPassword: "newpass1",
};

describe("resetPasswordSchema", () => {
  it("accepts valid input", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, email: "no" }).success,
    ).toBe(false);
  });

  it("rejects a code with length other than 6", () => {
    expect(
      resetPasswordSchema.safeParse({ ...valid, code: "12345" }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({ ...valid, code: "1234567" }).success,
    ).toBe(false);
  });

  it("rejects empty code", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, code: "" }).success).toBe(
      false,
    );
  });

  it("rejects password shorter than 8 chars", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...valid,
        newPassword: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });
});
