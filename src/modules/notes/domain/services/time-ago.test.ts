import { describe, expect, it } from "vitest";
import { timeAgo } from "./time-ago";

const now = new Date(2024, 5, 1, 12, 0, 0);
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

describe("timeAgo", () => {
  it("returns 'just now' when the diff is less than 60 seconds", () => {
    expect(timeAgo(ago(0), now)).toBe("just now");
    expect(timeAgo(ago(59), now)).toBe("just now");
  });

  it("returns minutes between 1m and 59m", () => {
    expect(timeAgo(ago(60), now)).toBe("1m ago");
    expect(timeAgo(ago(2 * 60), now)).toBe("2m ago");
    expect(timeAgo(ago(59 * 60), now)).toBe("59m ago");
  });

  it("returns hours between 1h and 23h", () => {
    expect(timeAgo(ago(3600), now)).toBe("1h ago");
    expect(timeAgo(ago(23 * 3600), now)).toBe("23h ago");
  });

  it("returns days for diffs >= 24h", () => {
    expect(timeAgo(ago(86400), now)).toBe("1d ago");
    expect(timeAgo(ago(7 * 86400), now)).toBe("7d ago");
  });

  it("treats future timestamps (negative diff) as 'just now'", () => {
    expect(timeAgo(new Date(now.getTime() + 5000), now)).toBe("just now");
  });

  it("defaults to the current Date when no 'now' is passed", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });
});
