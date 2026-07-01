import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

import {
  resetAIChatStore,
  useAIChatStore,
} from "../../infrastructure/stores/ai-chat.store";
import { AIChatInput } from "./AIChatInput";

describe("AIChatInput", () => {
  beforeEach(resetAIChatStore);
  afterEach(resetAIChatStore);

  it("submits trimmed text on Enter", () => {
    const onSubmit = vi.fn();
    render(<AIChatInput onSubmit={onSubmit} />);
    const ta = screen.getByPlaceholderText("Ask Inkwell Assistant…");
    fireEvent.change(ta, { target: { value: "  hello  " } });
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });

  it("does not submit on Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(<AIChatInput onSubmit={onSubmit} />);
    const ta = screen.getByPlaceholderText("Ask Inkwell Assistant…");
    fireEvent.change(ta, { target: { value: "multi" } });
    fireEvent.keyDown(ta, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit empty messages", () => {
    const onSubmit = vi.fn();
    render(<AIChatInput onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByPlaceholderText("Ask Inkwell Assistant…"), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit while loading", () => {
    useAIChatStore.setState({ isLoading: true });
    const onSubmit = vi.fn();
    render(<AIChatInput onSubmit={onSubmit} />);
    const ta = screen.getByPlaceholderText("Ask Inkwell Assistant…");
    fireEvent.change(ta, { target: { value: "hello" } });
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("opens and closes the attachment menu", () => {
    render(<AIChatInput onSubmit={() => {}} />);
    expect(screen.queryByText("Upload Image")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Attach" }));
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByText("Upload File")).toBeInTheDocument();
  });
});
