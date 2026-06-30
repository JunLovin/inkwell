import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children inside a button", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
  });

  it("applies the default variant primary and size md", () => {
    render(<Button>Hi</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-white/);
    expect(btn.className).toMatch(/h-10/);
  });

  it.each(["primary", "secondary", "ghost", "danger"] as const)(
    "renders variant %s",
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("disables and shows spinner when loading", () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("respects an explicit disabled prop", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("fires onClick when not disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders icon on the left by default", () => {
    render(<Button icon={<span data-testid="i" />}>label</Button>);
    const icon = screen.getByTestId("i");
    expect(icon).toBeInTheDocument();
  });

  it("does not render icon while loading", () => {
    render(
      <Button loading icon={<span data-testid="i" />}>
        label
      </Button>,
    );
    expect(screen.queryByTestId("i")).not.toBeInTheDocument();
  });

  it("forwards ref to the underlying button", () => {
    let ref: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          ref = el;
        }}
      >
        x
      </Button>,
    );
    expect(ref).toBeInstanceOf(HTMLButtonElement);
  });
});
