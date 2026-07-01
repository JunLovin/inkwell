import { describe, expect, it } from "vitest";
import { getGreeting } from "./greeting";

const at = (hour: number) => new Date(2024, 0, 1, hour, 0, 0);

describe("getGreeting", () => {
  it("returns Good morning at midnight", () => {
    expect(getGreeting(at(0))).toBe("Good morning");
  });

  it("returns Good morning at 11:59", () => {
    expect(getGreeting(new Date(2024, 0, 1, 11, 59, 0))).toBe("Good morning");
  });

  it("returns Good afternoon at noon", () => {
    expect(getGreeting(at(12))).toBe("Good afternoon");
  });

  it("returns Good afternoon at 17:59", () => {
    expect(getGreeting(new Date(2024, 0, 1, 17, 59, 0))).toBe("Good afternoon");
  });

  it("returns Good evening at 18:00", () => {
    expect(getGreeting(at(18))).toBe("Good evening");
  });

  it("returns Good evening at 23:59", () => {
    expect(getGreeting(new Date(2024, 0, 1, 23, 59, 0))).toBe("Good evening");
  });

  it("defaults to the current Date when no argument is passed", () => {
    const result = getGreeting();
    expect(["Good morning", "Good afternoon", "Good evening"]).toContain(
      result,
    );
  });
});
