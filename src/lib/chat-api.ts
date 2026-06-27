export async function chatWithGemini(messages: Array<{ role: string; text: string }>) {
  let response: Response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
  } catch (error) {
    const networkError = new Error("Tidak dapat terhubung ke endpoint /api/chat");
    (networkError as any).code = "NETWORK_ERROR";
    throw networkError;
  }

  let parsed: any = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message = parsed?.message || parsed?.error || `API error: ${response.status}`;
    const code = parsed?.code || (typeof message === "string" && /api key|apikey|limit|quota/i.test(message) ? "API_KEY_ERROR" : undefined);
    const error = new Error(message);
    (error as any).code = code;
    throw error;
  }

  return parsed ?? {};
}
