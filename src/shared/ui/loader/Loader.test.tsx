import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Loader } from "./Loader";

describe("Loader", () => {
  it("renders bar variant by default", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders circle variant", () => {
    const { container } = render(<Loader variant="circle" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders the label when provided (bar)", () => {
    render(<Loader label="Loading" />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders the label when provided (circle)", () => {
    render(<Loader variant="circle" label="Wait" />);
    expect(screen.getByText("Wait")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    const { container } = render(<Loader size={size} />);
    expect(container.firstChild).toBeTruthy();
  });
});
