import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "./change-password.schema";

const valid = {
  currentPassword: "oldpass",
  newPassword: "newpass1",
  confirmPassword: "newpass1",
};

describe("changePasswordSchema", () => {
  it("accepts valid input", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty current password", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: "" }).success,
    ).toBe(false);
  });

  it("rejects new password shorter than 8 chars", () => {
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        newPassword: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.join(".") === "confirmPassword"),
      ).toBe(true);
    }
  });
});
