"use client";

import { useEffect, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { X, Sparkles } from "lucide-react";
import gsap from "gsap";
import { api } from "@/convex/_generated/api";
import { useAIChatStore } from "@/lib/stores/ai-chat.store";
import { extractTextFromLexicalJSON } from "@/lib/utils/lexical.utils";
import { AIChatMessage } from "./AIChatMessage";
import { AIChatTyping } from "./AIChatTyping";
import { AIChatAttachment } from "./AIChatAttachment";
import { AIChatInput } from "./AIChatInput";
import type { ChatMessage } from "@/lib/types/ai-chat.types";

const EMPTY_MESSAGES: ChatMessage[] = [];

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
  } = useAIChatStore();

  const noteSlug =
    pathname.startsWith("/dashboard/notes/") && typeof params.slug === "string"
      ? params.slug
      : undefined;

  const contextId = noteSlug ? `note:${noteSlug}` : "dashboard";

  const messages = useAIChatStore(
    (s) => s.contextMessages[s.currentContext] ?? EMPTY_MESSAGES,
  );

  const currentNote = useQuery(
    api.notes.getNote,
    noteSlug ? { slug: noteSlug } : "skip",
  );

  const sendMessage = useAction(api.ai.chat);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

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
        onComplete: () => { gsap.set(panel, { display: "none" }); },
      });
    }
  }, [isOpen]);

  useEffect(() => {
    setContext(contextId);
  }, [contextId]);

  useEffect(() => {
    if (isOpen && currentNote && !attachedNote) {
      const plainText = currentNote.content
        ? extractTextFromLexicalJSON(currentNote.content)
        : currentNote.preview ?? "";
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

  const handleSubmit = async (text: string) => {
    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      type GeminiPart =
        | { text: string }
        | { inlineData: { mimeType: string; data: string } };

      type GeminiMessage = {
        role: "user" | "model";
        parts: GeminiPart[];
      };

      const history: GeminiMessage[] = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      const userParts: GeminiPart[] = [{ text }];
      for (const file of attachedFiles) {
        userParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
      }

      const allMessages: GeminiMessage[] = [
        ...history,
        { role: "user", parts: userParts },
      ];

      let systemPrompt: string | undefined;
      if (attachedNote) {
        systemPrompt = `You are Inkwell Assistant, an AI helper for the Inkwell note-taking app. The user has shared a note with you. Here is its full content:\n\n---\n${attachedNote.plainText}\n---\n\nHelp the user with questions, summaries, or any tasks related to this note or their writing.`;
      } else {
        systemPrompt =
          "You are Inkwell Assistant, an AI helper for the Inkwell note-taking app. Help the user with their notes, writing, and any questions they have.";
      }

      const response = await sendMessage({
        messages: allMessages,
        systemPrompt,
      });

      addMessage({ role: "assistant", content: response });
    } catch (err) {
      addMessage({
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
        <button
          onClick={close}
          className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8 text-center">
            <Sparkles className="w-8 h-8 text-zinc-700" />
            <p className="text-sm text-zinc-500 max-w-[220px]">
              Ask me anything about your notes or writing.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <AIChatMessage key={message.id} message={message} />
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
