import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
});

export const ChatResponseSchema = z.object({
  text: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
