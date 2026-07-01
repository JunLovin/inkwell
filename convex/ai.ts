import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { GoogleGenAI } from "@google/genai";
import { errors } from "./_shared/errors";

const MAX_MESSAGES = 40;
const MAX_TEXT_LENGTH = 20_000;
const MAX_INLINE_DATA_BYTES = 8 * 1024 * 1024;
const MAX_SYSTEM_PROMPT_LENGTH = 8_000;

const inlineDataValidator = v.object({
  mimeType: v.string(),
  data: v.string(),
});

const partValidator = v.union(
  v.object({ text: v.string() }),
  v.object({ inlineData: inlineDataValidator }),
);

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("model")),
  parts: v.array(partValidator),
});

function base64ByteLength(b64: string): number {
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export const chat = action({
  args: {
    messages: v.array(messageValidator),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    if (args.messages.length === 0) {
      throw errors.invalidInput("At least one message is required");
    }
    if (args.messages.length > MAX_MESSAGES) {
      throw errors.invalidInput(
        `Too many messages (max ${MAX_MESSAGES}). Clear the chat and try again.`,
      );
    }
    if (
      args.systemPrompt &&
      args.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH
    ) {
      throw errors.invalidInput("System prompt exceeds size limit");
    }
    for (const message of args.messages) {
      for (const part of message.parts) {
        if ("text" in part && part.text.length > MAX_TEXT_LENGTH) {
          throw errors.invalidInput("Message text exceeds size limit");
        }
        if (
          "inlineData" in part &&
          base64ByteLength(part.inlineData.data) > MAX_INLINE_DATA_BYTES
        ) {
          throw errors.invalidInput("Attached file exceeds size limit");
        }
      }
    }

    if (
      process.env.NODE_ENV !== "production" &&
      process.env.AI_TEST_MODE === "true"
    ) {
      return "[stub] reply";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw errors.aiNotConfigured();

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.messages,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        systemInstruction: args.systemPrompt,
      },
    });

    return result.text ?? "";
  },
});
