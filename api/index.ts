import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { GET as chatGET, POST as chatPOST } from "./chat.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/api/chat", async (c) => chatGET(c.req.raw));
app.post("/api/chat", async (c) => chatPOST(c.req.raw));
app.all("/api/trpc", async (c) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext,
    });
  } catch (error) {
    console.error("TRPC endpoint error:", error);
    return c.json({ error: "TRPC handler failed", message: "Endpoint tRPC tidak bisa diproses" }, 500);
  }
});
app.use("/api/trpc/*", async (c) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext,
    });
  } catch (error) {
    console.error("TRPC endpoint error:", error);
    return c.json({ error: "TRPC handler failed", message: "Endpoint tRPC tidak bisa diproses" }, 500);
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default async function handler(request: Request) {
  return app.fetch(request);
}
