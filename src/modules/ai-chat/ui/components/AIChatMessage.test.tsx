import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("shows Regenerate button only for the last assistant message with handler", () => {
    const onRegenerate = vi.fn();
    render(
      <AIChatMessage
        message={assistantMessage}
        isLast
        onRegenerate={onRegenerate}
      />,
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });

  it("does not show Regenerate for user messages", () => {
    render(
      <AIChatMessage message={userMessage} isLast onRegenerate={() => {}} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
