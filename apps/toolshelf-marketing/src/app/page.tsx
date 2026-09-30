import Link from "next/link";

import { WaitlistForm } from "@/components/waitlist-form";

const tools = [
  {
    name: "Typefolio",
    blurb: "Your fonts, synced — personal cloud library for designers and devs.",
  },
  {
    name: "Wholeboard",
    blurb: "Download a full Pinterest board as one original-quality zip.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
      <header className="mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Toolshelf</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          A shelf of sharp utilities for people who make things.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          One account. Open the tools you need — or get{" "}
          <strong className="font-medium text-[var(--fg)]">Shelf Pass</strong> (£49.99/yr) for
          everything on the shelf, including what we ship next.
        </p>
      </header>

      <section className="mb-14 rounded-xl border border-[var(--border)] bg-[#12100e] p-6 sm:p-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
          Waitlist
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We&apos;re opening the shelf soon. Be first to know when Typefolio and Wholeboard land on
          Toolshelf.
        </p>
        <div className="mt-6">
          <WaitlistForm />
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          On the shelf
        </h2>
        <ul className="mt-4 space-y-4">
          {tools.map((tool) => (
            <li
              key={tool.name}
              className="rounded-lg border border-[var(--border)] px-5 py-4"
            >
              <p className="font-medium">{tool.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{tool.blurb}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-[var(--accent)]">
                Coming to Toolshelf
              </p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)]">
        <p>
          Toolshelf ·{" "}
          <span className="text-[var(--fg)]">The Interface Company of Tomorrow Limited</span>
        </p>
        <p className="mt-2">
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-[var(--fg)]">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}
