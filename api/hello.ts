import app from "./app";

export default async function handler(request: Request) {
  return app.fetch(request);
}
