import { describe, expect, it } from "vitest";
import { registerSchema } from "./register.schema";

const valid = {
  name: "Mathias",
  email: "a@b.com",
  password: "pw123456",
  confirmPassword: "pw123456",
  flow: "signUp" as const,
};

describe("registerSchema", () => {
  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    expect(registerSchema.safeParse({ ...valid, name: "a" }).success).toBe(
      false,
    );
  });

  it("rejects empty name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects password shorter than 8 chars", () => {
    expect(
      registerSchema.safeParse({
        ...valid,
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched passwords with confirmPassword path", () => {
    const result = registerSchema.safeParse({
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

  it("rejects flow != signUp", () => {
    expect(registerSchema.safeParse({ ...valid, flow: "signIn" }).success).toBe(
      false,
    );
  });
});
