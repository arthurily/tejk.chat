"use client";

import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  prefVx: number;
  prefVy: number;
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

const getPhotoScale = (viewportWidth: number) => {
  if (viewportWidth <= 430) return 0.5;
  if (viewportWidth <= 640) return 0.6;
  if (viewportWidth <= 900) return 0.78;
  return 1;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [photoScale, setPhotoScale] = useState(1);
  const photoRefs = useRef<Array<HTMLDivElement | null>>([]);
  const chatLogRef = useRef<HTMLDivElement | null>(null);

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
        body: JSON.stringify({ messages: nextMessages, password: sessionPassword }),
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

  const onUnlock = async (event: FormEvent) => {
    event.preventDefault();
    if (isCheckingPassword) return;

    setIsCheckingPassword(true);
    setPasswordError("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setPasswordError(data.error ?? "Wrong password.");
        return;
      }

      setSessionPassword(passwordInput);
      setPasswordInput("");
      setIsUnlocked(true);
    } catch {
      setPasswordError("Could not verify password right now.");
    } finally {
      setIsCheckingPassword(false);
    }
  };

  useEffect(() => {
    const updateScale = () => setPhotoScale(getPhotoScale(window.innerWidth));
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    if (floatingPhotos.length === 0) return;

    const viewportWidth = () => window.innerWidth;
    const viewportHeight = () => window.innerHeight;
    const speedScale = Math.max(0.65, photoScale);

    const bodies: PhotoBody[] = floatingPhotos.map((photo, index) => {
      const w = Math.round(photo.size * photoScale);
      const h = Math.round(photo.size * 1.25 * photoScale);
      const maxX = Math.max(0, viewportWidth() - w);
      const maxY = Math.max(0, viewportHeight() - h);

      const seededX = percentToPx(photo.left, viewportWidth());
      const seededY = percentToPx(photo.top, viewportHeight());
      const x = Math.min(maxX, Math.max(0, seededX));
      const y = Math.min(maxY, Math.max(0, seededY));

      const fallbackDirection = index % 2 === 0 ? 1 : -1;
      const prefVx =
        signedNumber(photo.driftX, 10 * fallbackDirection) * 4.4 * speedScale;
      const prefVy =
        signedNumber(photo.driftY, 8 * -fallbackDirection) * 4.4 * speedScale;
      const vx = prefVx;
      const vy = prefVy;
      const rotation = signedNumber(photo.rotate, 0);
      const spin = (fallbackDirection * 8) / 10;

      return { x, y, w, h, vx, vy, prefVx, prefVy, rotation, spin };
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

      const ax = new Array<number>(bodies.length).fill(0);
      const ay = new Array<number>(bodies.length).fill(0);

      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = bodies[i];
          const b = bodies[j];
          const acx = a.x + a.w / 2;
          const acy = a.y + a.h / 2;
          const bcx = b.x + b.w / 2;
          const bcy = b.y + b.h / 2;
          const dx = acx - bcx;
          const dy = acy - bcy;
          const distance = Math.hypot(dx, dy) || 1;
          const minDistance = (a.w + b.w) * 0.42;

          if (distance >= minDistance) continue;

          const nx = dx / distance;
          const ny = dy / distance;
          const strength = ((minDistance - distance) / minDistance) * 110;
          const tangentDirection = (i + j) % 2 === 0 ? 1 : -1;
          const tx = -ny * tangentDirection;
          const ty = nx * tangentDirection;

          // Repel strongly when close, plus a mild side force so they slide past each other.
          ax[i] += nx * strength + tx * strength * 0.45;
          ay[i] += ny * strength + ty * strength * 0.45;
          ax[j] -= nx * strength + tx * strength * 0.45;
          ay[j] -= ny * strength + ty * strength * 0.45;
        }
      }

      for (let i = 0; i < bodies.length; i += 1) {
        const body = bodies[i];
        body.vx += ax[i] * dt;
        body.vy += ay[i] * dt;
        body.vx += (body.prefVx - body.vx) * 0.35 * dt;
        body.vy += (body.prefVy - body.vy) * 0.35 * dt;

        body.vx *= 0.995;
        body.vy *= 0.995;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.rotation += body.spin * dt;

        const right = maxWidth - body.w;
        const bottom = maxHeight - body.h;

        if (body.x <= 0) {
          body.x = 0;
          body.vx = Math.abs(body.vx) * 0.94;
        } else if (body.x >= right) {
          body.x = right;
          body.vx = -Math.abs(body.vx) * 0.94;
        }

        if (body.y <= 0) {
          body.y = 0;
          body.vy = Math.abs(body.vy) * 0.94;
        } else if (body.y >= bottom) {
          body.y = bottom;
          body.vy = -Math.abs(body.vy) * 0.94;
        }
      }

      applyStyles();
      rafId = requestAnimationFrame(step);
    };

    applyStyles();
    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [photoScale]);

  useLayoutEffect(() => {
    const node = chatLogRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isLoading]);

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
                  width: `${Math.round(photo.size * photoScale)}px`,
                } as CSSProperties
              }
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={Math.round(photo.size * photoScale)}
                height={Math.round(photo.size * 1.25 * photoScale)}
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

          {isUnlocked ? (
            <>
              <div ref={chatLogRef} className="chat-log">
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
            </>
          ) : (
            <form onSubmit={onUnlock} className="chat-lock">
              <p className="chat-lock-label">
                Enter password to access Tej chat
              </p>
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="chat-input"
                placeholder="Password"
              />
              {passwordError ? (
                <p className="chat-lock-error">{passwordError}</p>
              ) : null}
              <button
                type="submit"
                className="chat-send"
                disabled={isCheckingPassword}
              >
                {isCheckingPassword ? "Checking..." : "Unlock"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
