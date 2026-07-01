import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal separator by default", () => {
    render(<Divider />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("renders a vertical separator when orientation=vertical", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders the label as text and as aria-label", () => {
    render(<Divider label="OR" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-label", "OR");
    expect(screen.getByText("OR")).toBeInTheDocument();
  });
});
