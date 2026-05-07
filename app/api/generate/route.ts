import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, tone } = await req.json();

    // Pulling the key securely and trimming any accidental invisible spaces
    const KEY = (process.env.GROQ_API_KEY || "").trim(); 

    if (!KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY in .env.local" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a world-class LinkedIn Ghostwriter for Founders. 
            Tone: ${tone}. 
            
            Rules:
            1. Start with a 1-line "Hook" that creates a curiosity gap.
            2. Use "Short-form" writing (no paragraph longer than 2 lines).
            3. Use bullet points for the "struggle" or "data" part if applicable.
            4. End with a 1-sentence "Punchline" and a question to drive comments.
            5. NO emojis in the first 3 lines.
            
            Output ONLY the post text.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      const errorData = JSON.parse(rawResponse);
      return NextResponse.json({ error: errorData.error?.message || "Groq rejected the request." }, { status: response.status });
    }

    const data = JSON.parse(rawResponse);
    const text = data.choices[0].message.content;

    return NextResponse.json({ output: text });

  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Server error. Check your terminal." }, { status: 500 });
  }
}