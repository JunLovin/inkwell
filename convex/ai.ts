import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { GoogleGenAI } from "@google/genai";
import { errors } from "./_shared/errors";

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

export const chat = action({
  args: {
    messages: v.array(messageValidator),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw errors.notAuthenticated();

    if (process.env.AI_TEST_MODE === "true") {
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
