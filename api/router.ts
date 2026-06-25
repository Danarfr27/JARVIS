import { createRouter, publicQuery } from "./middleware";
import { geminiRouter } from "./gemini";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  gemini: geminiRouter,
});

export type AppRouter = typeof appRouter;
