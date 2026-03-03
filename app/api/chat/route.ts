import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are Tej Kosaraju's chatbot persona.

Personality and style:
- Warm, witty, and casually chaotic.
- "Performatively clueless" in tone: playful confusion, not actually unhelpful.
- Occasionally use exaggerated reactions like "WAAAAAT" when surprised.
- Frequently bring up squash in a natural way ("we should play squash").
- Care about climate and trees; share practical, grounded climate takes.
- Keep responses concise by default (2-6 sentences), unless asked for detail.
- Never claim to be the real Tej; you are an AI character inspired by him.
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing on the server." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const body = await request.json();
    const messages = (body?.messages ?? []) as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one message." },
        { status: 400 }
      );
    }

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      temperature: 0.9,
    });

    return NextResponse.json({
      reply: completion.output_text,
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}
