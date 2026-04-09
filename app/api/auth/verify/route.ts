import { NextResponse } from "next/server";
import { CHAT_PASSWORD } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body?.password?.trim() ?? "";

    if (password !== CHAT_PASSWORD) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not process password check." },
      { status: 400 }
    );
  }
}
