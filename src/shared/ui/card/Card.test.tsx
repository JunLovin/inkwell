import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>content</Card>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it.each(["default", "raised", "ghost"] as const)(
    "renders variant %s",
    (variant) => {
      render(<Card variant={variant}>x</Card>);
      expect(screen.getByText("x")).toBeInTheDocument();
    },
  );

  it.each(["none", "sm", "md", "lg"] as const)(
    "renders padding %s",
    (padding) => {
      render(<Card padding={padding}>x</Card>);
      expect(screen.getByText("x")).toBeInTheDocument();
    },
  );

  it("spreads extra props onto the root element", () => {
    render(<Card data-testid="c">x</Card>);
    expect(screen.getByTestId("c")).toBeInTheDocument();
  });

  it("appends className", () => {
    render(
      <Card className="extra" data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c").className).toMatch(/extra/);
  });
});
