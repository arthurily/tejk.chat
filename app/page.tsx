"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { floatingPhotos } from "./photoConfig";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterMessage: ChatMessage = {
  role: "assistant",
  content:
    "WAAAAAT, you made it to tejk.chat. Ask me anything, but also... when are we playing squash?",
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emptyStateHint = useMemo(
    () =>
      floatingPhotos.length === 0
        ? "Add images to /public/photos and entries in app/photoConfig.ts"
        : "",
    []
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply ?? "WAAAAAT happened?" },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get response.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `WAAAAAT, tiny issue: ${message}. Check your API key and try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        {floatingPhotos.length > 0 ? (
          floatingPhotos.map((photo) => (
            <div
              key={`${photo.src}-${photo.top}-${photo.left}`}
              className="floating-photo-frame"
              style={
                {
                  top: photo.top,
                  left: photo.left,
                  width: `${photo.size}px`,
                  animationDelay: photo.delay,
                  animationDuration: photo.duration,
                  ["--drift-x" as const]: photo.driftX,
                  ["--drift-y" as const]: photo.driftY,
                  ["--photo-rotate" as const]: photo.rotate,
                } as CSSProperties
              }
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.size}
                height={Math.round(photo.size * 1.25)}
                className="floating-photo"
              />
            </div>
          ))
        ) : (
          <>
            <div className="photo-placeholder left-[6%] top-[10%]" />
            <div className="photo-placeholder left-[78%] top-[18%]" />
            <div className="photo-placeholder left-[14%] top-[68%]" />
            <div className="photo-placeholder left-[76%] top-[73%]" />
            <p className="photo-hint">{emptyStateHint}</p>
          </>
        )}
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8">
        <section className="chat-shell w-full max-w-2xl">
          <header className="border-b border-black/10 px-5 py-4">
            <h1 className="text-lg font-semibold">tejk.chat</h1>
          </header>

          <div className="chat-log">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-bubble ${
                  message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading ? (
              <div className="chat-bubble chat-bubble-ai">Thinking...</div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="chat-input-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Say something to Tej"
              className="chat-input"
            />
            <button type="submit" className="chat-send" disabled={isLoading}>
              Send
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
