import { createRouter, publicQuery } from "./middleware.js";
import { geminiRouter } from "./gemini.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  gemini: geminiRouter,
});

export type AppRouter = typeof appRouter;
