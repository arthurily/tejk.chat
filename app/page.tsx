"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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

type PhotoBody = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
};

const percentToPx = (value: string, max: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? (parsed / 100) * max : 0;
};

const signedNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const photoRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  useEffect(() => {
    if (floatingPhotos.length === 0) return;

    const viewportWidth = () => window.innerWidth;
    const viewportHeight = () => window.innerHeight;

    const bodies: PhotoBody[] = floatingPhotos.map((photo, index) => {
      const w = photo.size;
      const h = Math.round(photo.size * 1.25);
      const maxX = Math.max(0, viewportWidth() - w);
      const maxY = Math.max(0, viewportHeight() - h);

      const seededX = percentToPx(photo.left, viewportWidth());
      const seededY = percentToPx(photo.top, viewportHeight());
      const x = Math.min(maxX, Math.max(0, seededX));
      const y = Math.min(maxY, Math.max(0, seededY));

      const fallbackDirection = index % 2 === 0 ? 1 : -1;
      const vx = signedNumber(photo.driftX, 10 * fallbackDirection) * 7;
      const vy = signedNumber(photo.driftY, 8 * -fallbackDirection) * 7;
      const rotation = signedNumber(photo.rotate, 0);
      const spin = (fallbackDirection * 12) / 10;

      return { x, y, w, h, vx, vy, rotation, spin };
    });

    let rafId = 0;
    let previousTime = performance.now();

    const applyStyles = () => {
      bodies.forEach((body, index) => {
        const frame = photoRefs.current[index];
        if (!frame) return;
        frame.style.transform = `translate3d(${body.x}px, ${body.y}px, 0) rotate(${body.rotation}deg)`;
      });
    };

    const step = (now: number) => {
      const dt = Math.min(0.033, (now - previousTime) / 1000);
      previousTime = now;

      const maxWidth = viewportWidth();
      const maxHeight = viewportHeight();

      for (const body of bodies) {
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.rotation += body.spin * dt;

        const right = maxWidth - body.w;
        const bottom = maxHeight - body.h;

        if (body.x <= 0) {
          body.x = 0;
          body.vx = Math.abs(body.vx);
        } else if (body.x >= right) {
          body.x = right;
          body.vx = -Math.abs(body.vx);
        }

        if (body.y <= 0) {
          body.y = 0;
          body.vy = Math.abs(body.vy);
        } else if (body.y >= bottom) {
          body.y = bottom;
          body.vy = -Math.abs(body.vy);
        }
      }

      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = bodies[i];
          const b = bodies[j];

          const overlapsX = a.x < b.x + b.w && a.x + a.w > b.x;
          const overlapsY = a.y < b.y + b.h && a.y + a.h > b.y;

          if (!overlapsX || !overlapsY) continue;

          const overlapX = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
          const overlapY = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);

          if (overlapX < overlapY) {
            const shift = overlapX / 2;
            if (a.x < b.x) {
              a.x -= shift;
              b.x += shift;
            } else {
              a.x += shift;
              b.x -= shift;
            }

            const nextVxA = b.vx * 0.98;
            b.vx = a.vx * 0.98;
            a.vx = nextVxA;
          } else {
            const shift = overlapY / 2;
            if (a.y < b.y) {
              a.y -= shift;
              b.y += shift;
            } else {
              a.y += shift;
              b.y -= shift;
            }

            const nextVyA = b.vy * 0.98;
            b.vy = a.vy * 0.98;
            a.vy = nextVyA;
          }
        }
      }

      applyStyles();
      rafId = requestAnimationFrame(step);
    };

    applyStyles();
    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        {floatingPhotos.length > 0 ? (
          floatingPhotos.map((photo, index) => (
            <div
              key={`${photo.src}-${photo.top}-${photo.left}`}
              className="floating-photo-frame"
              ref={(node) => {
                photoRefs.current[index] = node;
              }}
              style={
                {
                  left: "0",
                  top: "0",
                  width: `${photo.size}px`,
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
