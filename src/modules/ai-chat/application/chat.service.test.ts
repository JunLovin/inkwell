import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createChatService } from "./chat.service";
import type {
  ChatRepositoryPort,
  SendMessagePayload,
} from "../domain/repositories/chat.repository";
import type { ChatMessage } from "../domain/entities/chat-message";

function makeRepo(
  send: (p: SendMessagePayload) => Promise<string>,
): ChatRepositoryPort {
  return { useSendMessage: () => send };
}

describe("createChatService.useSendMessage", () => {
  it("maps user/assistant history to gemini user/model roles", async () => {
    const send = vi.fn<(p: SendMessagePayload) => Promise<string>>(
      async () => "ok",
    );
    const svc = createChatService(makeRepo(send));
    const { result } = renderHook(() => svc.useSendMessage());
    const history: ChatMessage[] = [
      { id: "1", role: "user", content: "q1" },
      { id: "2", role: "assistant", content: "a1" },
    ];
    await result.current({
      history,
      text: "q2",
      attachedFiles: [],
      attachedNote: null,
    });
    const payload = send.mock.calls[0][0];
    expect(payload.messages).toHaveLength(3);
    expect(payload.messages[0]).toEqual({
      role: "user",
      parts: [{ text: "q1" }],
    });
    expect(payload.messages[1]).toEqual({
      role: "model",
      parts: [{ text: "a1" }],
    });
    expect(payload.messages[2].role).toBe("user");
  });

  it("appends attached files as inlineData parts on the user message", async () => {
    const send = vi.fn<(p: SendMessagePayload) => Promise<string>>(
      async () => "ok",
    );
    const svc = createChatService(makeRepo(send));
    const { result } = renderHook(() => svc.useSendMessage());
    await result.current({
      history: [],
      text: "hello",
      attachedFiles: [
        { id: "f", name: "x.png", mimeType: "image/png", data: "b64" },
      ],
      attachedNote: null,
    });
    const last = send.mock.calls[0][0].messages[0];
    expect(last.parts).toHaveLength(2);
    expect(last.parts[0]).toEqual({ text: "hello" });
    expect(last.parts[1]).toEqual({
      inlineData: { mimeType: "image/png", data: "b64" },
    });
  });

  it("passes a system prompt that reflects the attached note", async () => {
    const send = vi.fn<(p: SendMessagePayload) => Promise<string>>(
      async () => "ok",
    );
    const svc = createChatService(makeRepo(send));
    const { result } = renderHook(() => svc.useSendMessage());
    await result.current({
      history: [],
      text: "hi",
      attachedFiles: [],
      attachedNote: { id: "n", title: "t", slug: "s", plainText: "note body" },
    });
    expect(send.mock.calls[0][0].systemPrompt).toContain("note body");
  });

  it("returns the repo response verbatim", async () => {
    const send = vi.fn<(p: SendMessagePayload) => Promise<string>>(
      async () => "response text",
    );
    const svc = createChatService(makeRepo(send));
    const { result } = renderHook(() => svc.useSendMessage());
    const out = await result.current({
      history: [],
      text: "hi",
      attachedFiles: [],
      attachedNote: null,
    });
    expect(out).toBe("response text");
  });

  it("propagates errors thrown by the repository", async () => {
    const send = vi.fn<(p: SendMessagePayload) => Promise<string>>(async () => {
      throw new Error("upstream failure");
    });
    const svc = createChatService(makeRepo(send));
    const { result } = renderHook(() => svc.useSendMessage());
    await expect(
      result.current({
        history: [],
        text: "hi",
        attachedFiles: [],
        attachedNote: null,
      }),
    ).rejects.toThrow("upstream failure");
  });
});
