import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetAIChatStore, useAIChatStore } from "./ai-chat.store";

describe("useAIChatStore", () => {
  beforeEach(resetAIChatStore);
  afterEach(resetAIChatStore);

  describe("panel visibility", () => {
    it("open() sets isOpen to true", () => {
      useAIChatStore.getState().open();
      expect(useAIChatStore.getState().isOpen).toBe(true);
    });

    it("close() sets isOpen to false and clears attached files", () => {
      useAIChatStore.setState({
        isOpen: true,
        attachedFiles: [
          { id: "f", name: "x", mimeType: "image/png", data: "b64" },
        ],
      });
      useAIChatStore.getState().close();
      const state = useAIChatStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.attachedFiles).toEqual([]);
    });

    it("toggle() flips isOpen and clears files when closing", () => {
      useAIChatStore.getState().toggle();
      expect(useAIChatStore.getState().isOpen).toBe(true);
      useAIChatStore.setState({
        attachedFiles: [
          { id: "f", name: "x", mimeType: "image/png", data: "b64" },
        ],
      });
      useAIChatStore.getState().toggle();
      const state = useAIChatStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.attachedFiles).toEqual([]);
    });
  });

  describe("setContext", () => {
    it("switches context and clears attached note", () => {
      useAIChatStore.setState({
        attachedNote: { id: "n", title: "t", slug: "s", plainText: "p" },
      });
      useAIChatStore.getState().setContext("note:hello");
      const state = useAIChatStore.getState();
      expect(state.currentContext).toBe("note:hello");
      expect(state.attachedNote).toBeNull();
    });

    it("is a no-op when context is unchanged", () => {
      const note = { id: "n", title: "t", slug: "s", plainText: "p" };
      useAIChatStore.setState({
        currentContext: "dashboard",
        attachedNote: note,
      });
      useAIChatStore.getState().setContext("dashboard");
      expect(useAIChatStore.getState().attachedNote).toBe(note);
    });
  });

  describe("addMessage", () => {
    it("appends a message to the current context with a generated id", () => {
      useAIChatStore.getState().addMessage({ role: "user", content: "hi" });
      const messages = useAIChatStore.getState().contextMessages["dashboard"];
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ role: "user", content: "hi" });
      expect(typeof messages[0].id).toBe("string");
    });

    it("keeps messages isolated per context", () => {
      useAIChatStore
        .getState()
        .addMessage({ role: "user", content: "dashboard msg" });
      useAIChatStore.getState().setContext("note:abc");
      useAIChatStore
        .getState()
        .addMessage({ role: "user", content: "note msg" });
      const state = useAIChatStore.getState();
      expect(state.contextMessages["dashboard"]).toHaveLength(1);
      expect(state.contextMessages["note:abc"]).toHaveLength(1);
    });
  });

  describe("attached files", () => {
    it("addAttachedFile() appends and removeAttachedFile() removes", () => {
      const a = { id: "a", name: "a", mimeType: "image/png", data: "1" };
      const b = { id: "b", name: "b", mimeType: "image/png", data: "2" };
      useAIChatStore.getState().addAttachedFile(a);
      useAIChatStore.getState().addAttachedFile(b);
      expect(useAIChatStore.getState().attachedFiles).toHaveLength(2);
      useAIChatStore.getState().removeAttachedFile("a");
      expect(useAIChatStore.getState().attachedFiles).toEqual([b]);
    });
  });

  describe("setAttachedNote / setLoading", () => {
    it("setAttachedNote() updates the attached note", () => {
      const note = { id: "n", title: "t", slug: "s", plainText: "p" };
      useAIChatStore.getState().setAttachedNote(note);
      expect(useAIChatStore.getState().attachedNote).toBe(note);
    });

    it("setLoading() toggles isLoading", () => {
      useAIChatStore.getState().setLoading(true);
      expect(useAIChatStore.getState().isLoading).toBe(true);
      useAIChatStore.getState().setLoading(false);
      expect(useAIChatStore.getState().isLoading).toBe(false);
    });
  });

  describe("clearContext", () => {
    it("empties the current context and attached files", () => {
      useAIChatStore.getState().addMessage({ role: "user", content: "a" });
      useAIChatStore
        .getState()
        .addAttachedFile({ id: "f", name: "n", mimeType: "x", data: "d" });
      useAIChatStore.getState().clearContext();
      const state = useAIChatStore.getState();
      expect(state.contextMessages["dashboard"]).toEqual([]);
      expect(state.attachedFiles).toEqual([]);
    });
  });

  describe("removeLastAssistantMessage", () => {
    it("removes the last message when it is an assistant message", () => {
      useAIChatStore.getState().addMessage({ role: "user", content: "q" });
      useAIChatStore.getState().addMessage({ role: "assistant", content: "a" });
      useAIChatStore.getState().removeLastAssistantMessage();
      const messages = useAIChatStore.getState().contextMessages["dashboard"];
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("user");
    });

    it("is a no-op when the last message is from the user", () => {
      useAIChatStore.getState().addMessage({ role: "user", content: "q" });
      useAIChatStore.getState().removeLastAssistantMessage();
      expect(
        useAIChatStore.getState().contextMessages["dashboard"],
      ).toHaveLength(1);
    });

    it("is a no-op when there are no messages", () => {
      useAIChatStore.getState().removeLastAssistantMessage();
      expect(
        useAIChatStore.getState().contextMessages["dashboard"],
      ).toBeUndefined();
    });
  });
});
