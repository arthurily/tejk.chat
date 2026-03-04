"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Wrong password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/70 p-6 shadow-xl backdrop-blur-md">
        <h1 className="text-xl font-semibold text-zinc-900">Enter Password</h1>
        <p className="mt-1 text-sm text-zinc-700">
          Password is required to access the chatbot.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-black/20 bg-white/85 px-3 py-2 outline-none focus:border-black/40"
            autoFocus
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Checking..." : "Enter"}
          </button>
        </form>
      </section>
    </main>
  );
}
