import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders a horizontal divider by default", () => {
    const { container } = render(<Divider />);
    expect((container.firstChild as HTMLElement).className).toMatch(/h-px/);
  });

  it("renders a vertical divider when orientation=vertical", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/w-px/);
  });

  it("renders the label when provided", () => {
    render(<Divider label="OR" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });
});
