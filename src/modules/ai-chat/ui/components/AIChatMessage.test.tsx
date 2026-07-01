import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ChatMessage } from "../../domain/entities/chat-message";
import { AIChatMessage } from "./AIChatMessage";

const userMessage: ChatMessage = { id: "1", role: "user", content: "hi there" };
const assistantMessage: ChatMessage = {
  id: "2",
  role: "assistant",
  content: "hello back",
};

describe("AIChatMessage", () => {
  it("renders user message content", () => {
    render(<AIChatMessage message={userMessage} />);
    expect(screen.getByText("hi there")).toBeInTheDocument();
  });

  it("renders assistant message content via markdown", () => {
    render(<AIChatMessage message={assistantMessage} />);
    expect(screen.getByText("hello back")).toBeInTheDocument();
  });

  it("shows Regenerate button for the last assistant message and calls onRegenerate", () => {
    const onRegenerate = vi.fn();
    render(
      <AIChatMessage
        message={assistantMessage}
        isLast
        onRegenerate={onRegenerate}
      />,
    );
    const button = screen.getByRole("button", { name: "Regenerate response" });
    fireEvent.click(button);
    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it("hides Regenerate when isLast is false", () => {
    render(
      <AIChatMessage message={assistantMessage} onRegenerate={() => {}} />,
    );
    expect(
      screen.queryByRole("button", { name: "Regenerate response" }),
    ).not.toBeInTheDocument();
  });

  it("renders a Copy button on assistant messages", () => {
    render(<AIChatMessage message={assistantMessage} />);
    expect(
      screen.getByRole("button", { name: "Copy message" }),
    ).toBeInTheDocument();
  });

  it("does not render any action buttons for user messages", () => {
    render(
      <AIChatMessage message={userMessage} isLast onRegenerate={() => {}} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
