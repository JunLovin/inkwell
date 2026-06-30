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
    fireEvent.mouseEnter(screen.getByText("trigger").parentElement!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful");
    fireEvent.mouseLeave(screen.getByText("trigger").parentElement!);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus and hides on blur", () => {
    render(
      <Tooltip content="x">
        <button>trigger</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("trigger").parentElement!);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.blur(screen.getByText("trigger").parentElement!);
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
      fireEvent.mouseEnter(screen.getByText("t").parentElement!);
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    },
  );
});
