import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("gsap", () => import("@/shared/__test-utils__/mock-gsap"));

const { mocks } = vi.hoisted(() => ({
  mocks: {
    sendMessage: vi.fn<(params: unknown) => Promise<string>>(),
    pathname: "/dashboard",
    params: {} as Record<string, string | undefined>,
    note: undefined as
      | {
          _id: string;
          title: string;
          slug: string;
          content?: string;
          preview?: string;
        }
      | undefined,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useParams: () => mocks.params,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/modules/notes", () => ({
  useNote: () => ({ note: mocks.note, isLoading: false }),
}));

vi.mock("@/lib/lexical", () => ({
  extractTextFromLexicalJSON: () => "extracted text",
}));

vi.mock("../../infrastructure/hooks/use-chat", () => ({
  useSendChatMessage: () => mocks.sendMessage,
}));

import {
  resetAIChatStore,
  useAIChatStore,
} from "../../infrastructure/stores/ai-chat.store";
import { AIChatPanel } from "./AIChatPanel";

const typeMessage = (text: string) => {
  const ta = screen.getByPlaceholderText("Ask Inkwell Assistant…");
  fireEvent.change(ta, { target: { value: text } });
  fireEvent.keyDown(ta, { key: "Enter" });
};

const flush = () => waitFor(() => undefined);

describe("AIChatPanel", () => {
  beforeEach(() => {
    resetAIChatStore();
    mocks.sendMessage.mockReset();
    mocks.pathname = "/dashboard";
    mocks.params = {};
    mocks.note = undefined;
  });

  afterEach(resetAIChatStore);

  describe("render", () => {
    it("shows header title", () => {
      render(<AIChatPanel />);
      expect(screen.getByText("Inkwell Assistant")).toBeInTheDocument();
    });

    it("shows dashboard empty-state copy when no note is attached", () => {
      render(<AIChatPanel />);
      expect(
        screen.getByText("Ask anything about your notes or writing."),
      ).toBeInTheDocument();
    });

    it("shows note empty-state copy when a note is attached", () => {
      useAIChatStore.setState({
        attachedNote: { id: "n", title: "t", slug: "s", plainText: "p" },
      });
      render(<AIChatPanel />);
      expect(
        screen.getByText("Ask anything about this note."),
      ).toBeInTheDocument();
    });

    it("hides Clear chat button when there are no messages", () => {
      render(<AIChatPanel />);
      expect(screen.queryByLabelText("Clear chat")).not.toBeInTheDocument();
    });

    it("shows Clear chat button when there are messages", () => {
      useAIChatStore.setState({
        contextMessages: {
          dashboard: [{ id: "1", role: "user", content: "hi" }],
        },
      });
      render(<AIChatPanel />);
      expect(screen.getByLabelText("Clear chat")).toBeInTheDocument();
    });
  });

  describe("submit flow", () => {
    it("appends user + assistant messages and calls sendMessage with the right payload", async () => {
      mocks.sendMessage.mockResolvedValueOnce("hello back");
      render(<AIChatPanel />);
      typeMessage("hi");
      await waitFor(() => {
        const messages = useAIChatStore.getState().contextMessages["dashboard"];
        expect(messages).toHaveLength(2);
        expect(messages[0]).toMatchObject({ role: "user", content: "hi" });
        expect(messages[1]).toMatchObject({
          role: "assistant",
          content: "hello back",
        });
      });
      expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
      const call = mocks.sendMessage.mock.calls[0][0] as {
        text: string;
        attachedFiles: unknown[];
        attachedNote: unknown;
        history: unknown[];
      };
      expect(call.text).toBe("hi");
      expect(call.attachedFiles).toEqual([]);
      expect(call.attachedNote).toBeNull();
      expect(call.history).toEqual([]);
    });

    it("appends an apology assistant message when sendMessage rejects", async () => {
      mocks.sendMessage.mockRejectedValueOnce(new Error("boom"));
      render(<AIChatPanel />);
      typeMessage("hi");
      await waitFor(() => {
        const messages = useAIChatStore.getState().contextMessages["dashboard"];
        expect(messages).toHaveLength(2);
        expect(messages[1]).toMatchObject({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        });
      });
    });

    it("toggles isLoading around the call", async () => {
      let resolveSend: (value: string) => void = () => {};
      mocks.sendMessage.mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            resolveSend = resolve;
          }),
      );
      render(<AIChatPanel />);
      typeMessage("hi");
      await waitFor(() => {
        expect(useAIChatStore.getState().isLoading).toBe(true);
      });
      resolveSend("done");
      await waitFor(() => {
        expect(useAIChatStore.getState().isLoading).toBe(false);
      });
    });
  });

  describe("suggestion clicks", () => {
    it("submits the suggestion text", async () => {
      mocks.sendMessage.mockResolvedValueOnce("ok");
      render(<AIChatPanel />);
      fireEvent.click(screen.getByText("Summarize my recent notes"));
      await waitFor(() => {
        const messages = useAIChatStore.getState().contextMessages["dashboard"];
        expect(messages[0]).toMatchObject({
          role: "user",
          content: "Summarize my recent notes",
        });
      });
    });

    it("disables suggestions while loading", async () => {
      useAIChatStore.setState({ isLoading: true });
      render(<AIChatPanel />);
      const suggestion = screen.getByText(
        "Summarize my recent notes",
      ) as HTMLButtonElement;
      expect(suggestion).toBeDisabled();
    });
  });

  describe("regenerate flow", () => {
    it("removes the last assistant message and re-calls sendMessage with the last user prompt", async () => {
      useAIChatStore.setState({
        contextMessages: {
          dashboard: [
            { id: "u1", role: "user", content: "first" },
            { id: "a1", role: "assistant", content: "original" },
          ],
        },
      });
      mocks.sendMessage.mockResolvedValueOnce("regenerated");
      render(<AIChatPanel />);
      fireEvent.click(
        screen.getByRole("button", {
          name: "Regenerate response",
          hidden: true,
        }),
      );
      await waitFor(() => {
        const messages = useAIChatStore.getState().contextMessages["dashboard"];
        expect(messages).toHaveLength(2);
        expect(messages[1]).toMatchObject({
          role: "assistant",
          content: "regenerated",
        });
      });
      expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
      const call = mocks.sendMessage.mock.calls[0][0] as {
        text: string;
        history: Array<{ role: string; content: string }>;
      };
      expect(call.text).toBe("first");
      expect(call.history).toHaveLength(1);
      expect(call.history[0]).toMatchObject({ role: "user", content: "first" });
    });

    it("does not regenerate while already loading", async () => {
      useAIChatStore.setState({
        isLoading: true,
        contextMessages: {
          dashboard: [
            { id: "u1", role: "user", content: "first" },
            { id: "a1", role: "assistant", content: "original" },
          ],
        },
      });
      render(<AIChatPanel />);
      fireEvent.click(
        screen.getByRole("button", {
          name: "Regenerate response",
          hidden: true,
        }),
      );
      await flush();
      expect(mocks.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("context", () => {
    it("switches to noteContextId when pathname matches /dashboard/notes/:slug", () => {
      mocks.pathname = "/dashboard/notes/my-note";
      mocks.params = { slug: "my-note" };
      render(<AIChatPanel />);
      expect(useAIChatStore.getState().currentContext).toBe("note:my-note");
    });

    it("uses dashboard context outside of a note route", () => {
      render(<AIChatPanel />);
      expect(useAIChatStore.getState().currentContext).toBe("dashboard");
    });
  });

  describe("attached note plumbing", () => {
    it("sets attachedNote with extracted text when isOpen and a note is loaded", async () => {
      useAIChatStore.setState({ isOpen: true });
      mocks.note = {
        _id: "n1",
        title: "Tea",
        slug: "tea",
        content: "{}",
      };
      render(<AIChatPanel />);
      await waitFor(() => {
        expect(useAIChatStore.getState().attachedNote).toEqual({
          id: "n1",
          title: "Tea",
          slug: "tea",
          plainText: "extracted text",
        });
      });
    });

    it("falls back to preview when content is empty", async () => {
      useAIChatStore.setState({ isOpen: true });
      mocks.note = {
        _id: "n1",
        title: "Tea",
        slug: "tea",
        preview: "short preview",
      };
      render(<AIChatPanel />);
      await waitFor(() => {
        expect(useAIChatStore.getState().attachedNote?.plainText).toBe(
          "short preview",
        );
      });
    });

    it("does not overwrite an already attached note", async () => {
      const existing = {
        id: "existing",
        title: "Existing",
        slug: "existing",
        plainText: "kept",
      };
      useAIChatStore.setState({ isOpen: true, attachedNote: existing });
      mocks.note = {
        _id: "n1",
        title: "Other",
        slug: "other",
        content: "{}",
      };
      render(<AIChatPanel />);
      await flush();
      expect(useAIChatStore.getState().attachedNote).toBe(existing);
    });
  });
});
