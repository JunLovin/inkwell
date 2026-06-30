import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders children", () => {
    render(<Chip>tag</Chip>);
    expect(screen.getByText("tag")).toBeInTheDocument();
  });

  it.each([
    "default",
    "active",
    "success",
    "warning",
    "danger",
    "info",
  ] as const)("renders variant %s", (variant) => {
    render(<Chip variant={variant}>x</Chip>);
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  it("does not render a remove button by default", () => {
    render(<Chip>x</Chip>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a remove button when removable", () => {
    render(<Chip removable>x</Chip>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onRemove and stops propagation when the remove button is clicked", () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(
      <Chip removable onRemove={onRemove} onClick={onClick}>
        x
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when the chip is clicked", () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>x</Chip>);
    fireEvent.click(screen.getByText("x"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
