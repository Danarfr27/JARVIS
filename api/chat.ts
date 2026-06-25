const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  // If no API key, return mock response for testing
  if (!GEMINI_API_KEY) {
    // Mock response untuk testing
    const mockResponses = [
      "Halo! Saya adalah JARVIS, asisten AI Anda. Bagaimana saya bisa membantu Anda hari ini?",
      "Saya siap membantu Anda dengan berbagai pertanyaan dan tugas. Apa yang ingin Anda ketahui?",
      "Terima kasih telah menghubungi saya. Saya di sini untuk membantu Anda. Ada yang bisa saya bantu?",
      "Halo! Saya JARVIS, asisten virtual Anda. Silakan tanyakan apa saja yang ingin Anda ketahui.",
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Log untuk debugging
    console.log("DEBUG: No GEMINI_API_KEY set, using mock response");
    
    return new Response(
      JSON.stringify({ 
        text: randomResponse,
        _debug: "Mock response - set GEMINI_API_KEY environment variable for real responses"
      }),
      {
        status: 200,
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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      console.error("Gemini error response:", errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}`, details: errorText }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat memproses permintaan Anda.";

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

