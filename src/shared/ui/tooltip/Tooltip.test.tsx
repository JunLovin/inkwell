import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders children", () => {
    render(
      <Tooltip content="Hello">
        <button>trigger</button>
      </Tooltip>,
    );
    expect(screen.getByText("trigger")).toBeInTheDocument();
  });

  it("shows tooltip content on mouse enter and hides on leave", () => {
    render(
      <Tooltip content="Helpful">
        <button>trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByTestId("tooltip-trigger");
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful");
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus and hides on blur", () => {
    render(
      <Tooltip content="x">
        <button>trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByTestId("tooltip-trigger");
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "supports side %s",
    (side) => {
      render(
        <Tooltip content="x" side={side}>
          <button>t</button>
        </Tooltip>,
      );
      fireEvent.mouseEnter(screen.getByTestId("tooltip-trigger"));
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    },
  );
});
