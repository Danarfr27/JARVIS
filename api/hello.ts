import app from "./app.js";

export default async function handler(request: Request) {
  return app.fetch(request);
}
