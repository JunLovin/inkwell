import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

import { Toast } from "./Toast";
import { resetToastStore, useToastStore } from "@/shared/stores/toast.store";

describe("Toast", () => {
  beforeEach(resetToastStore);
  afterEach(resetToastStore);

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

  it("dismiss button is exposed with an accessible label", () => {
    useToastStore.setState({
      toasts: [{ id: "4", title: "t", variant: "info", duration: 100000 }],
    });
    render(<Toast />);
    const dismiss = screen.getByLabelText("Dismiss notification");
    expect(dismiss).toBeInTheDocument();
    expect(() => fireEvent.click(dismiss)).not.toThrow();
  });
});
