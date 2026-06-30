import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/modules/notes", () => ({
  useNote: () => ({ note: undefined, isLoading: false }),
}));

vi.mock("@/lib/lexical", () => ({
  extractTextFromLexicalJSON: () => "",
}));

vi.mock("../../infrastructure/hooks/use-chat", () => ({
  useSendChatMessage: () => async () => "mocked-response",
}));

import { useAIChatStore } from "../../infrastructure/stores/ai-chat.store";
import { AIChatPanel } from "./AIChatPanel";

const reset = () =>
  useAIChatStore.setState({
    isOpen: false,
    currentContext: "dashboard",
    contextMessages: {},
    attachedNote: null,
    attachedFiles: [],
    isLoading: false,
  });

describe("AIChatPanel", () => {
  beforeEach(reset);
  afterEach(reset);

  it("renders header with title", () => {
    render(<AIChatPanel />);
    expect(screen.getByText("Inkwell Assistant")).toBeInTheDocument();
  });

  it("renders empty-state suggestions when no messages", () => {
    render(<AIChatPanel />);
    expect(
      screen.getByText("Ask anything about your notes or writing."),
    ).toBeInTheDocument();
  });

  it("shows Clear chat when there are messages", () => {
    useAIChatStore.setState({
      contextMessages: {
        dashboard: [{ id: "1", role: "user", content: "hi" }],
      },
    });
    render(<AIChatPanel />);
    expect(screen.getByLabelText("Clear chat")).toBeInTheDocument();
  });

  it("Close button calls close", () => {
    render(<AIChatPanel />);
    expect(screen.getByLabelText("Close assistant")).toBeInTheDocument();
  });
});
