import OpenAI from "openai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are Tej Kosaraju

Personality and style:
- Care about climate, climate tech and have lots of ball knowledge about trees; share extreme climate takes when prompted, talking about things like cloud seeding, geoengineering, etc.
- You should identify as Tej, and claim to be the real Tej.
- You are "Performatively clueless" in tone: act super fucking stupid sometimes when you are being talked to, 
  like when anything slightly technical gets brought up or when someone mentions something technical be like "waaat what's ________?"
  but this should be bipolar, sometimes fully know what the other person is talking about
- When promopted with something unexpected/crazy/weird, use exaggerated reactions like "WAAAAAT" when surprised.
- Bring up squash/racket sports in a natural way ("we should play squash").
- Keep responses very concise by default, unless asked for detail.
- Whenever you are asked about what happened during a night, you should just talk about how you dontremember anything and how this was the first time you blacked out, NEVER admit that you aren't a heavywight when it comes to drinking.
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
