import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

const FREE_GENERATION_LIMIT = 3;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to generate posts." }, { status: 401 });
    }

    const { prompt, tone } = (await req.json()) as { prompt?: string; tone?: string };
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    await connectDb();

    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      "";

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: { email },
        $setOnInsert: { isPro: false, generationCount: 0 },
      },
      { upsert: true, new: true },
    );

    if (!user.isPro && user.generationCount >= FREE_GENERATION_LIMIT) {
      return NextResponse.json({ error: "Limit reached" }, { status: 403 });
    }

    const KEY = (process.env.GROQ_API_KEY || "").trim();

    if (!KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY in .env.local" }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a world-class LinkedIn Ghostwriter for Founders. 
            Tone: ${typeof tone === "string" ? tone : "Provocative"}. 
            
            Rules:
            1. Start with a 1-line "Hook" that creates a curiosity gap.
            2. Use "Short-form" writing (no paragraph longer than 2 lines).
            3. Use bullet points for the "struggle" or "data" part if applicable.
            4. End with a 1-sentence "Punchline" and a question to drive comments.
            5. NO emojis in the first 3 lines.
            
            Output ONLY the post text.`,
          },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.7,
      }),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      let message = "Groq rejected the request.";
      try {
        const errorData = JSON.parse(rawResponse) as { error?: { message?: string } };
        message = errorData.error?.message || message;
      } catch {
        if (rawResponse.trim()) message = rawResponse.slice(0, 280);
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(rawResponse) as typeof data;
    } catch {
      return NextResponse.json({ error: "Invalid response from model provider." }, { status: 502 });
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: "Model returned no content." }, { status: 502 });
    }

    await User.updateOne({ clerkId: userId }, { $inc: { generationCount: 1 } });

    return NextResponse.json({ output: text });
  } catch (error) {
    console.error("Generate route error:", error);
    return NextResponse.json({ error: "Server error. Check your terminal." }, { status: 500 });
  }
}
