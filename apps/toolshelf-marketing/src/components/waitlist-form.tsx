"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list. We'll email you when the shelf opens.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3">
      <label className="sr-only" htmlFor="waitlist-email">Email</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          disabled={status === "loading" || status === "success"}
          onChange={(event) => setEmail(event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[#141210] px-4 py-3 text-sm text-[var(--fg)] outline-none ring-[var(--accent)] focus:ring-2"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[#1a1208] transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-red-300" : "text-[var(--muted)]"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
