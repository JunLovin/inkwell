"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Plus, Image as ImageIcon, Paperclip } from "lucide-react";
import gsap from "gsap";

import { useToast } from "@/shared/hooks/use-toast";
import { useAIChatStore } from "../../infrastructure/stores/ai-chat.store";
import type { AttachedFile } from "../../domain/entities/chat-message";
import {
  MAX_ATTACHMENT_BYTES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  isAllowedAttachmentMime,
} from "../../domain/services/attachment-limits";

type Props = {
  onSubmit: (text: string) => void;
};

const acceptImage = "image/*";
const acceptFile = ALLOWED_ATTACHMENT_MIME_TYPES.filter(
  (m) => !m.startsWith("image/"),
).join(",");

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}

export function AIChatInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoading, addAttachedFile } = useAIChatStore();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const plusContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const ctx = gsap.context(() => {
      if (menuOpen) {
        gsap.fromTo(
          menu,
          { opacity: 0, y: 6, scale: 0.97, filter: "blur(3px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.22,
            ease: "power3.out",
          },
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 6,
          scale: 0.97,
          filter: "blur(3px)",
          duration: 0.15,
          ease: "power2.in",
        });
      }
    });
    return () => ctx.revert();
  }, [menuOpen]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        plusContainerRef.current &&
        !plusContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isAllowedAttachmentMime(file.type)) {
      toast.error({
        title: "Unsupported file type",
        description: `${file.type || "unknown"} isn't supported yet.`,
      });
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error({
        title: "File is too large",
        description: `Max ${humanBytes(MAX_ATTACHMENT_BYTES)}, your file is ${humanBytes(file.size)}.`,
      });
      return;
    }

    try {
      const data = await readFileAsBase64(file);
      const attachment: AttachedFile = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        name: file.name,
        mimeType: file.type,
        data,
      };
      addAttachedFile(attachment);
    } catch {
      toast.error({ title: "Could not read file" });
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="p-3">
      <div className="flex items-end gap-2 bg-zinc-800/50 border border-zinc-700/60 rounded-2xl px-3 py-2.5">
        <div
          ref={plusContainerRef}
          className="relative shrink-0 self-end mb-0.5"
        >
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Attach"
            className="w-7 h-7 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/60 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute bottom-full left-0 mb-2 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-xl shadow-black/40 z-50"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  imageInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-150 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Upload Image</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-150 cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span>Upload File</span>
              </button>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept={acceptImage}
            className="hidden"
            onChange={handleFileSelected}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptFile}
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Inkwell Assistant…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed min-h-[24px] max-h-24 overflow-y-auto"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className={`shrink-0 self-end mb-0.5 w-7 h-7 flex items-center justify-center rounded-xl transition-colors ${
            canSend
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "bg-zinc-700/60 text-zinc-600 cursor-not-allowed"
          }`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
