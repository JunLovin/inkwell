import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it.each([
    "default",
    "active",
    "success",
    "warning",
    "danger",
    "info",
  ] as const)("renders variant %s", (variant) => {
    render(<Badge variant={variant}>x</Badge>);
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("does not render a dot by default", () => {
    render(<Badge>x</Badge>);
    expect(screen.queryByTestId("badge-dot")).not.toBeInTheDocument();
  });

  it("renders a dot when dot=true", () => {
    render(<Badge dot>x</Badge>);
    expect(screen.getByTestId("badge-dot")).toBeInTheDocument();
  });
});
