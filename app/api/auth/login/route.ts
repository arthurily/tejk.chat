import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_VALUE,
  CHAT_PASSWORD,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body?.password?.trim() ?? "";

    if (password !== CHAT_PASSWORD) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE_NAME, ACCESS_COOKIE_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not process login request." },
      { status: 400 }
    );
  }
}
