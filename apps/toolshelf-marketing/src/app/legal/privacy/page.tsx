import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-[var(--muted)]">
      <Link href="/" className="text-[var(--accent)] underline underline-offset-2">
        ← Toolshelf
      </Link>
      <h1 className="mt-8 text-2xl font-semibold text-[var(--fg)]">Privacy policy</h1>
      <p className="mt-2 text-xs uppercase tracking-wide">Effective 30 September 2026</p>

      <section className="mt-8 space-y-4">
        <p>
          <strong className="text-[var(--fg)]">Who we are.</strong> Toolshelf is operated by{" "}
          <strong className="text-[var(--fg)]">The Interface Company of Tomorrow Limited</strong>{" "}
          (&quot;we&quot;, &quot;us&quot;). This policy covers the Toolshelf marketing site at
          toolshelf.supply.
        </p>
        <p>
          <strong className="text-[var(--fg)]">What we collect.</strong> If you join the waitlist, we
          collect your email address. We may also collect standard server logs (IP address, browser
          type) from our hosting provider.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Why we use it.</strong> To tell you when Toolshelf and
          its tools launch, and to improve the site. We do not sell your personal data.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Processors.</strong> We use Vercel (hosting) and may use
          Resend (email). Data may be processed in the UK, EU, or US depending on provider
          infrastructure.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Your rights.</strong> You may ask for access, correction,
          or deletion of your waitlist data by contacting us. UK residents may complain to the ICO.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Contact.</strong>{" "}
          <a
            className="text-[var(--accent)] underline"
            href="mailto:hamza@theinterfaces.company"
          >
            hamza@theinterfaces.company
          </a>
        </p>
      </section>
    </div>
  );
}
