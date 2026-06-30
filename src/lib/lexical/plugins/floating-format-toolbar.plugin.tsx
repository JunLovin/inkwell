"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { gsap } from "gsap";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code2,
  Link,
  X,
  Check,
} from "lucide-react";

import { usePortalMounted } from "@/shared/hooks/use-portal-mounted";

type Coords = { top: number; left: number };

type ActiveFormats = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  code: boolean;
  link: boolean;
  linkUrl: string;
};

const defaultFormats: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  link: false,
  linkUrl: "",
};

export function FloatingFormatToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const mounted = usePortalMounted();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [activeFormats, setActiveFormats] =
    useState<ActiveFormats>(defaultFormats);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.read(() => {
          const sel = $getSelection();
          if (!$isRangeSelection(sel) || sel.isCollapsed()) {
            setCoords(null);
            setShowLinkInput(false);
            return;
          }

          const nativeSel = window.getSelection();
          if (!nativeSel || nativeSel.rangeCount === 0) {
            setCoords(null);
            return;
          }

          const rect = nativeSel.getRangeAt(0).getBoundingClientRect();
          if (rect.width === 0) {
            setCoords(null);
            return;
          }

          const linkNode = sel
            .getNodes()
            .find((node) => $isLinkNode(node.getParent()));
          const isLink = !!linkNode;
          const linkUrl =
            isLink && $isLinkNode(linkNode?.getParent())
              ? ((
                  linkNode.getParent() as { getURL?: () => string }
                ).getURL?.() ?? "")
              : "";

          setActiveFormats({
            bold: sel.hasFormat("bold"),
            italic: sel.hasFormat("italic"),
            underline: sel.hasFormat("underline"),
            strikethrough: sel.hasFormat("strikethrough"),
            code: sel.hasFormat("code"),
            link: isLink,
            linkUrl,
          });

          setCoords({
            top: rect.top - 48,
            left: rect.left + rect.width / 2,
          });
        });
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return unsubscribe;
  }, [editor]);

  useEffect(() => {
    if (!coords || !toolbarRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        toolbarRef.current,
        { opacity: 0, y: 6, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, [coords]);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const handleLinkSubmit = () => {
    const url = linkInputValue.trim();
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target: "_blank" });
    }
    setShowLinkInput(false);
    setLinkInputValue("");
  };

  const handleLinkRemove = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setShowLinkInput(false);
    setLinkInputValue("");
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLinkSubmit();
    } else if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkInputValue("");
    }
  };

  if (!mounted || !coords) return null;

  const formatButtons = [
    {
      format: "bold" as const,
      icon: <Bold size={13} />,
      active: activeFormats.bold,
    },
    {
      format: "italic" as const,
      icon: <Italic size={13} />,
      active: activeFormats.italic,
    },
    {
      format: "underline" as const,
      icon: <Underline size={13} />,
      active: activeFormats.underline,
    },
    {
      format: "strikethrough" as const,
      icon: <Strikethrough size={13} />,
      active: activeFormats.strikethrough,
    },
    {
      format: "code" as const,
      icon: <Code2 size={13} />,
      active: activeFormats.code,
    },
  ];

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
      className="flex items-center gap-0.5 px-1.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/50"
      onMouseDown={(e) => e.preventDefault()}
    >
      {showLinkInput ? (
        <div className="flex items-center gap-1.5 px-1">
          <input
            ref={linkInputRef}
            type="url"
            value={linkInputValue}
            onChange={(e) => setLinkInputValue(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder="https://..."
            className="bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white px-2 py-1 outline-none w-48 placeholder:text-zinc-600"
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Check size={12} />
          </button>
          {activeFormats.link && (
            <button
              type="button"
              onClick={handleLinkRemove}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : (
        <>
          {formatButtons.map(({ format, icon, active }) => (
            <button
              key={format}
              type="button"
              onClick={() =>
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
              }
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {icon}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-800 mx-0.5" />
          <button
            type="button"
            onClick={() => {
              setLinkInputValue(activeFormats.linkUrl);
              setShowLinkInput(true);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              activeFormats.link
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Link size={13} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
