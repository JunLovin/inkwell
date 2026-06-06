"use client";

import { createChatService } from "../../application/chat.service";
import { convexChatRepository } from "../repositories/convex-chat.repository";

const chatService = createChatService(convexChatRepository);

export const useSendChatMessage = chatService.useSendMessage;
