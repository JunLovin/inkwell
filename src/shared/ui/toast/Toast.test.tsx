import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => {
  const chain = () => ({
    to: () => chain(),
    fromTo: () => chain(),
    set: () => chain(),
    kill: () => chain(),
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

import { Toast } from "./Toast";
import { useToastStore } from "@/shared/stores/toast.store";

const reset = () => useToastStore.setState({ toasts: [] });

describe("Toast", () => {
  beforeEach(reset);
  afterEach(reset);

  it("renders nothing when no toasts are present", () => {
    render(<Toast />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a toast added to the store", () => {
    useToastStore.setState({
      toasts: [
        { id: "1", title: "Saved", variant: "success", duration: 100000 },
      ],
    });
    render(<Toast />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for danger and warning", () => {
    useToastStore.setState({
      toasts: [{ id: "2", title: "Boom", variant: "danger", duration: 100000 }],
    });
    render(<Toast />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    useToastStore.setState({
      toasts: [
        {
          id: "3",
          title: "t",
          description: "d",
          variant: "info",
          duration: 100000,
        },
      ],
    });
    render(<Toast />);
    expect(screen.getByText("d")).toBeInTheDocument();
  });

  it("dismiss button triggers gsap removal", () => {
    useToastStore.setState({
      toasts: [{ id: "4", title: "t", variant: "info", duration: 100000 }],
    });
    render(<Toast />);
    fireEvent.click(screen.getByLabelText("Dismiss notification"));
  });
});
