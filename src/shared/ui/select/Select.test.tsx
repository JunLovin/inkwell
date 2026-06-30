import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => {
  const chain = () => ({
    to: () => chain(),
    fromTo: () => chain(),
    set: () => chain(),
  });
  return {
    default: {
      to: () => chain(),
      fromTo: () => chain(),
      set: () => chain(),
      timeline: () => chain(),
    },
  };
});

import { Select } from "./Select";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
];

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select options={options} placeholder="Pick" />);
    expect(screen.getByText("Pick")).toBeInTheDocument();
  });

  it("shows the selected label", () => {
    render(<Select options={options} value="b" />);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
  });

  it("opens the menu and fires onChange", () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Alpha"));
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("does not fire onChange for disabled options", () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Gamma"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a label", () => {
    render(<Select options={options} label="Country" />);
    expect(screen.getByText("Country")).toBeInTheDocument();
  });

  it("renders an error message", () => {
    render(<Select options={options} error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("renders a hint when no error", () => {
    render(<Select options={options} hint="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("disables interaction when disabled", () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
