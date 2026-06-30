import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a bare input", () => {
    render(<Input placeholder="search" />);
    expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
  });

  it("renders a label and associates it via htmlFor / id", () => {
    render(<Input label="Email Address" />);
    const input = screen.getByLabelText("Email Address");
    expect(input).toHaveAttribute("id", "email-address");
  });

  it("uses an explicit id when provided", () => {
    render(<Input label="Email" id="custom" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "custom");
  });

  it("shows an error message when error is provided", () => {
    render(<Input error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows hint when no error is set", () => {
    render(<Input hint="we will not spam" />);
    expect(screen.getByText("we will not spam")).toBeInTheDocument();
  });

  it("prefers error over hint when both are set", () => {
    render(<Input error="Bad" hint="hint" />);
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.queryByText("hint")).not.toBeInTheDocument();
  });

  it("fires onChange", () => {
    let value = "";
    render(
      <Input
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hi" } });
    expect(value).toBe("hi");
  });

  it("renders leading and trailing slots", () => {
    render(
      <Input
        leading={<span data-testid="l" />}
        trailing={<span data-testid="t" />}
      />,
    );
    expect(screen.getByTestId("l")).toBeInTheDocument();
    expect(screen.getByTestId("t")).toBeInTheDocument();
  });
});
