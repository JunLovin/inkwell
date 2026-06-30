import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a bare textarea", () => {
    render(<Textarea placeholder="say something" />);
    expect(screen.getByPlaceholderText("say something")).toBeInTheDocument();
  });

  it("renders a label associated by id", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText("Bio")).toHaveAttribute("id", "bio");
  });

  it("shows error and prefers error over hint", () => {
    render(<Textarea error="Too long" hint="optional" />);
    expect(screen.getByText("Too long")).toBeInTheDocument();
    expect(screen.queryByText("optional")).not.toBeInTheDocument();
  });

  it("fires onChange", () => {
    let value = "";
    render(
      <Textarea
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(value).toBe("hi");
  });

  it("applies resize-none by default", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").className).toMatch(/resize-none/);
  });

  it("applies resize-y when resize=true", () => {
    render(<Textarea resize />);
    expect(screen.getByRole("textbox").className).toMatch(/resize-y/);
  });
});
