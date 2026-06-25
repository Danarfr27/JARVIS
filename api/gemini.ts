import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { ChatRequestSchema } from "@contracts/gemini";

// Free Gemini API endpoint - no API key needed for gemini-2.0-fl-lite-preview
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

export const geminiRouter = createRouter({
  chat: publicQuery
    .input(ChatRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const contents = input.messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

        const response = await fetch(`${GEMINI_API_URL}?key=AIzaSyCfmj-JsVO0o3Sh5mb9fgUsstPPigKfLb8`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat memproses permintaan Anda.";

        return { text };
      } catch (error) {
        console.error("Gemini API error:", error);
        return { 
          text: "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti." 
        };
      }
    }),
});
