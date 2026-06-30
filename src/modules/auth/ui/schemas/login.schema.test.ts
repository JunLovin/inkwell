import { describe, expect, it } from "vitest";
import { loginSchema } from "./login.schema";

describe("loginSchema", () => {
  it("accepts valid credentials with flow signIn", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pw",
      flow: "signIn",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "pw",
      flow: "signIn",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "nope",
      password: "pw",
      flow: "signIn",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "",
      flow: "signIn",
    });
    expect(result.success).toBe(false);
  });

  it("rejects flow != signIn", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "pw",
      flow: "signUp",
    });
    expect(result.success).toBe(false);
  });
});
