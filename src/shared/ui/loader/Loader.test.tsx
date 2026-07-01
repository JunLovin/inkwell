import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Loader } from "./Loader";

describe("Loader", () => {
  it("uses role=status with a default Loading label (bar)", () => {
    render(<Loader />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading");
  });

  it("uses role=status with a default Loading label (circle)", () => {
    render(<Loader variant="circle" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("uses the provided label as aria-label and renders it as text (bar)", () => {
    render(<Loader label="Saving notes" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Saving notes");
    expect(screen.getByText("Saving notes")).toBeInTheDocument();
  });

  it("uses the provided label as aria-label and renders it as text (circle)", () => {
    render(<Loader variant="circle" label="Wait" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Wait");
    expect(screen.getByText("Wait")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    render(<Loader size={size} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
