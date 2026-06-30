import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconBox } from "./IconBox";

describe("IconBox", () => {
  it("renders the icon", () => {
    render(<IconBox icon={<span data-testid="i" />} />);
    expect(screen.getByTestId("i")).toBeInTheDocument();
  });

  it.each([
    "default",
    "active",
    "success",
    "warning",
    "danger",
    "info",
  ] as const)("renders variant %s", (variant) => {
    render(<IconBox icon={<span />} variant={variant} />);
  });

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    render(<IconBox icon={<span />} size={size} />);
  });

  it.each(["md", "lg", "full"] as const)("renders rounded %s", (rounded) => {
    render(<IconBox icon={<span />} rounded={rounded} />);
  });
});
