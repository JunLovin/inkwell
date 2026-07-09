"use client";

import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePathname, useParams } from "next/navigation";
import { Eraser, Sparkles, X } from "lucide-react";
import gsap from "gsap";

import { Tooltip } from "@/shared/ui/tooltip";
import { useNote, type NoteId } from "@/modules/notes";
import { extractTextFromLexicalJSON } from "@/lib/lexical";

import { useAIChatStore } from "../../infrastructure/stores/ai-chat.store";
import { useSendChatMessage } from "../../infrastructure/hooks/use-chat";
import {
  dashboardContextId,
  noteContextId,
} from "../../domain/entities/chat-context";
import { getSuggestions } from "../../domain/services/prompt-suggestions";
import { isWriterIntent } from "../../domain/services/writer-intent";
import type { ChatMessage } from "../../domain/entities/chat-message";

import { AIChatMessage } from "./AIChatMessage";
import { AIChatTyping } from "./AIChatTyping";
import { AIChatAttachment } from "./AIChatAttachment";
import { AIChatInput } from "./AIChatInput";

const EMPTY_MESSAGES: readonly ChatMessage[] = Object.freeze([]);

export function AIChatPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const params = useParams();

  const {
    isOpen,
    attachedNote,
    attachedFiles,
    isLoading,
    close,
    addMessage,
    setAttachedNote,
    setLoading,
    setContext,
    clearContext,
    removeLastAssistantMessage,
    setPendingInsertion,
  } = useAIChatStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      attachedNote: s.attachedNote,
      attachedFiles: s.attachedFiles,
      isLoading: s.isLoading,
      close: s.close,
      addMessage: s.addMessage,
      setAttachedNote: s.setAttachedNote,
      setLoading: s.setLoading,
      setContext: s.setContext,
      clearContext: s.clearContext,
      removeLastAssistantMessage: s.removeLastAssistantMessage,
      setPendingInsertion: s.setPendingInsertion,
    })),
  );

  const noteSlug =
    pathname.startsWith("/dashboard/notes/") && typeof params.slug === "string"
      ? params.slug
      : undefined;

  const contextId = noteSlug ? noteContextId(noteSlug) : dashboardContextId;

  const messages = useAIChatStore(
    (s) => s.contextMessages[s.currentContext] ?? EMPTY_MESSAGES,
  );

  const { note: currentNote } = useNote(noteSlug ?? "");
  const sendMessage = useSendChatMessage();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    gsap.killTweensOf(panel);

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.set(panel, { display: "flex" });
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.95, y: 16, filter: "blur(4px)" },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.35,
            ease: "power3.out",
          },
        );
      } else {
        gsap.to(panel, {
          opacity: 0,
          scale: 0.95,
          y: 16,
          filter: "blur(4px)",
          duration: 0.25,
          ease: "power3.in",
          onComplete: () => {
            if (!useAIChatStore.getState().isOpen) {
              gsap.set(panel, { display: "none" });
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  useEffect(() => {
    setContext(contextId);
  }, [contextId, setContext]);

  useEffect(() => {
    if (isOpen && currentNote && !attachedNote) {
      const plainText = currentNote.content
        ? extractTextFromLexicalJSON(currentNote.content)
        : (currentNote.preview ?? "");
      setAttachedNote({
        id: currentNote._id,
        title: currentNote.title,
        slug: currentNote.slug,
        plainText,
      });
    }
  }, [isOpen, currentNote, attachedNote, setAttachedNote]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const runPrompt = useCallback(
    async (text: string, history: ChatMessage[]) => {
      setLoading(true);
      const writerMode = isWriterIntent(text) && !!attachedNote?.id;
      try {
        const response = await sendMessage({
          history,
          text,
          attachedFiles,
          attachedNote,
          mode: writerMode ? "writer" : "chat",
        });
        if (writerMode && attachedNote?.id) {
          setPendingInsertion({
            noteId: attachedNote.id as NoteId,
            markdown: response,
          });
          addMessage({
            role: "assistant",
            content: "Inserted into your note.",
          });
        } else {
          addMessage({ role: "assistant", content: response });
        }
      } catch {
        addMessage({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      sendMessage,
      attachedFiles,
      attachedNote,
      addMessage,
      setLoading,
      setPendingInsertion,
    ],
  );

  const handleSubmit = async (text: string) => {
    const history =
      useAIChatStore.getState().contextMessages[
        useAIChatStore.getState().currentContext
      ] ?? [];
    addMessage({ role: "user", content: text });
    await runPrompt(text, history);
  };

  const handleRegenerate = async () => {
    if (isLoading) return;
    const state = useAIChatStore.getState();
    const currentMessages = state.contextMessages[state.currentContext] ?? [];
    const lastUser = [...currentMessages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUser) return;
    removeLastAssistantMessage();
    const afterRemoval =
      useAIChatStore.getState().contextMessages[
        useAIChatStore.getState().currentContext
      ] ?? [];
    await runPrompt(lastUser.content, afterRemoval);
  };

  return (
    <div
      ref={panelRef}
      style={{ display: "none" }}
      className="fixed bottom-20 right-6 z-[150] w-[380px] max-h-[520px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 flex-col overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="flex-1 text-sm font-medium text-zinc-100">
          Inkwell Assistant
        </span>
        {messages.length > 0 && (
          <Tooltip content="Clear chat">
            <button
              type="button"
              onClick={clearContext}
              aria-label="Clear chat"
              className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close assistant"
          className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8 text-center">
            <Sparkles className="w-8 h-8 text-zinc-700" />
            <p className="text-sm text-zinc-500 max-w-[220px]">
              {attachedNote
                ? "Ask anything about this note."
                : "Ask anything about your notes or writing."}
            </p>
            <div className="flex flex-col gap-1.5 w-full max-w-[280px]">
              {getSuggestions(attachedNote).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSubmit(prompt)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, idx) => (
          <AIChatMessage
            key={message.id}
            message={message}
            isLast={idx === messages.length - 1}
            onRegenerate={handleRegenerate}
          />
        ))}
        {isLoading && <AIChatTyping />}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-zinc-800">
        <AIChatAttachment />
        <AIChatInput onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
