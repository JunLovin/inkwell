"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { ChatRepositoryPort } from "../../domain/repositories/chat.repository";

export const convexChatRepository: ChatRepositoryPort = {
  useSendMessage: () => {
    const send = useAction(api.ai.chat);
    return async ({ messages, mode, attachedNote }) =>
      send({ messages, mode, attachedNote });
  },
};
