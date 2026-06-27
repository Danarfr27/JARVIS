import "./lib/env";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-tts-preview";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("[api/chat] GEMINI_MODEL=", GEMINI_MODEL, "GEMINI_API_KEY_SET=", Boolean(GEMINI_API_KEY));

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "Use POST /api/chat with a JSON body containing { messages: [{ role, text }] }.",
      model: GEMINI_MODEL,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    console.error("/api/chat error: GEMINI_API_KEY missing");
    return new Response(
      JSON.stringify({
        error: "API key missing or disconnected",
        code: "API_KEY_ERROR",
        message: "apikey firdhan bot tidak tersambung",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(payload?.messages) || payload.messages.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid request payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const geminiUrl = GEMINI_API_KEY ? `${GEMINI_API_URL}?key=${GEMINI_API_KEY}` : GEMINI_API_URL;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: payload.messages.map((msg: any) => ({
          role: msg.role || "user",
          parts: [{ text: msg.text || "" }],
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error response:", response.status, errorText);
      const apiKeyError = [400, 401, 403, 429].includes(response.status) || /api key|quota|limit/i.test(errorText.toLowerCase());
      return new Response(
        JSON.stringify({
          error: apiKeyError ? "API key missing or limit exceeded" : `Gemini API error: ${response.status}`,
          code: apiKeyError ? "API_KEY_ERROR" : "GENERIC_API_ERROR",
          message: apiKeyError ? "apikey firdhan bot tidak tersambung" : errorText,
          details: errorText,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = (await response.json()) as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat memproses permintaan Anda.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/chat error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

