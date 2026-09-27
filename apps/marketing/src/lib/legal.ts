export const LEGAL_EFFECTIVE = "27 September 2026";
export const LEGAL_EMAIL = "hello@typefolio.app";

export type LegalSlug = "privacy" | "terms" | "cookies" | "refunds";

export const LEGAL_PAGES: {
  slug: LegalSlug;
  title: string;
  description: string;
}[] = [
  {
    slug: "privacy",
    title: "Privacy policy",
    description: "What we collect, why, and how you can ask us to delete it.",
  },
  {
    slug: "terms",
    title: "Terms of service",
    description: "The rules for using Typefolio on the web and in native apps.",
  },
  {
    slug: "cookies",
    title: "Cookie policy",
    description: "Session cookies on the product app, and what the marketing site uses.",
  },
  {
    slug: "refunds",
    title: "Refunds and cancellation",
    description: "Trials, Polar billing, and how to cancel or request a refund.",
  },
];

export function isLegalSlug(value: string): value is LegalSlug {
  return LEGAL_PAGES.some((page) => page.slug === value);
}

export type LegalBlock = { heading: string; body: string[] };

export const LEGAL_BODY: Record<LegalSlug, LegalBlock[]> = {
  privacy: [
    {
      heading: "Who we are",
      body: [
        "Typefolio is a personal cloud font library with sync for web and desktop. These pages are published by Typefolio, operated from the United Kingdom. Questions: hello@typefolio.app.",
        "The product app lives at app.typefolio.app. The marketing site lives at typefolio.app. Desktop and companion apps talk to the product app.",
      ],
    },
    {
      heading: "What we collect",
      body: [
        "Account: name, email, password hash or Google sign-in identifiers, and optional passkeys. We send verification, password reset, and transactional mail to that address.",
        "Library: font files you upload (.ttf, .otf, .woff, .woff2), filenames, family metadata, collections, favourites, and share links you create.",
        "Devices: device names and sync activity so we can show which machines are connected and enforce plan limits.",
        "Billing: Polar (our merchant of record) processes cards and tax. We store Polar customer and subscription identifiers, plan status, and usage events we send to Polar for metering — not your full card number.",
        "Technical: IP address, user agent, and similar logs from hosting (Vercel) as needed to run and secure the service.",
      ],
    },
    {
      heading: "Why we use it",
      body: [
        "To provide the service: authenticate you, store your library, sync and install fonts on devices you connect, and bill the plan you choose.",
        "To communicate about the account: email verification, security, receipts via Polar, and service notices. We do not sell your personal data.",
        "Lawful bases under UK GDPR are contract (providing Typefolio), legitimate interests (security, product reliability), and legal obligation (tax records Polar keeps as merchant of record).",
      ],
    },
    {
      heading: "Processors",
      body: [
        "Vercel hosts the sites and serverless APIs. Neon stores application data in Postgres. Object storage (Vercel Blob) holds font files and desktop installers. Resend sends email. Polar handles checkout, VAT/GST where applicable, invoices, and the customer portal. Google only if you choose Google sign-in.",
      ],
    },
    {
      heading: "Retention and your rights",
      body: [
        "We keep account and library data while the account exists. You can delete your account in the product app; we then cancel Polar billing where we can, delete libraries and files we store, and remove profile rows we control. Backups and processor logs may lag for a short period.",
        "You may request access, correction, deletion, restriction, or portability, and you may complain to the ICO in the UK. Email hello@typefolio.app.",
        "Fonts stay yours. We do not claim ownership of typefaces you upload. We only process them to provide sync and install.",
      ],
    },
    {
      heading: "Children and international transfers",
      body: [
        "Typefolio is not directed at children under 16. Processors may store data in the US or EU. We rely on their standard contractual clauses or equivalent safeguards.",
      ],
    },
  ],
  terms: [
    {
      heading: "The service",
      body: [
        "Typefolio lets you upload fonts you already have the right to use, keep them in a private library, and sync or install them on supported devices. It is a utility, not a font foundry, marketplace, or licence shop.",
        "Web, Mac, and later Windows, Linux, and iPad clients are part of the same product. Features depend on your plan (free, Launch, or Pro). We may change free caps, launch pricing for new customers, and platform availability.",
      ],
    },
    {
      heading: "Your account",
      body: [
        "You must be able to form a contract (18+ in most places). Keep credentials and passkeys safe. You are responsible for activity on the account.",
        "You must have a valid licence or other right to upload and install each font. Do not upload malware, others’ commercial fonts you are not licensed to copy, or content that is illegal. We may suspend or delete libraries that breach this.",
      ],
    },
    {
      heading: "Our software",
      body: [
        "Desktop and native apps are licensed to you, not sold. You may install them for your own use with your Typefolio account. You may not reverse engineer them except where the law allows, resell the apps as your product, or use them to provide a competing public font CDN.",
        "Installers downloaded from typefolio.app may auto-update if we ship updates. You can stop using the apps at any time.",
      ],
    },
    {
      heading: "Plans, Polar, and the trial",
      body: [
        "Paid plans are billed by Polar as merchant of record. Launch pricing, when offered, stays locked for that subscription while it remains active. Cancelling ends access to paid features at the end of the paid period unless Polar’s portal says otherwise.",
        "A trial (currently 7 days on Launch, unless we state otherwise at checkout) may apply. If you do not cancel before the trial ends, Polar charges the then-applicable price shown at checkout.",
      ],
    },
    {
      heading: "Availability and liability",
      body: [
        "We aim for reliable sync but do not guarantee uninterrupted service, complete font metadata, or that every design app will see newly installed fonts without a restart.",
        "To the extent UK law allows, Typefolio is provided as-is. We are not liable for lost font licences, third-party foundry disputes, or consequential loss. Nothing here limits liability for death, personal injury, or fraud, or other rights you cannot waive as a consumer.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of England and Wales. UK consumers also keep mandatory local rights. We may update these pages; continued use after the effective date is acceptance of the revised terms. Material billing changes will be flagged in-product or by email where practical.",
      ],
    },
  ],
  cookies: [
    {
      heading: "Marketing site (typefolio.app)",
      body: [
        "The marketing site is static. We do not set an advertising cookie banner for third-party ads. Hosting may set strictly technical cookies or similar (for example Vercel’s deployment and security headers). Download links fetch installer files; that is not advertising tracking.",
      ],
    },
    {
      heading: "Product app (app.typefolio.app)",
      body: [
        "Signed-in sessions use first-party cookies from Better Auth (session token). Those cookies are necessary to keep you logged in, protect CSRF, and enforce HTTPS in production. We also use a small preference cookie for sidebar open/closed state in the web UI.",
        "Google sign-in, if you use it, is Google’s flow and their cookies on accounts.google.com. Polar checkout and the customer portal run on Polar’s domains and follow Polar’s cookie policy.",
      ],
    },
    {
      heading: "Desktop and native apps",
      body: [
        "Native apps store a token on the device instead of a browser cookie. That token is used to call app.typefolio.app APIs. Clearing the app or signing out removes it.",
      ],
    },
    {
      heading: "Choices",
      body: [
        "You can block cookies in the browser. The product app will not stay signed in without the session cookie. There is no non-essential marketing pixel on typefolio.app as of this policy. If we add analytics later, we will update this page and use a consent tool where required.",
      ],
    },
  ],
  refunds: [
    {
      heading: "How billing works",
      body: [
        "Payments are charged by Polar, not by a card form on typefolio.app. Invoices, VAT where Polar collects it, payment method, and cancellation live in Polar’s customer portal (Settings → Manage billing in the app).",
      ],
    },
    {
      heading: "Trials and cancellation",
      body: [
        "If checkout includes a free trial, cancel in the portal before the trial ends to avoid the first charge. After you are paying, cancel any time; you keep paid features until the end of the current period. Launch grandfathering applies only while that subscription stays active.",
      ],
    },
    {
      heading: "Refunds",
      body: [
        "Digital subscriptions are generally non-refundable once a paid period has started, except where Polar’s policy or UK consumer law requires otherwise (for example a fault we cannot fix, a duplicate charge, or a cooling-off right that still applies to your purchase).",
        "If you believe a charge is wrong, email hello@typefolio.app with the account email and Polar receipt. We will look at Polar’s records and request a refund through Polar when it is justified. Polar’s own refund timelines apply to the card.",
      ],
    },
    {
      heading: "Account deletion",
      body: [
        "Deleting the Typefolio account cancels the Polar subscription we can cancel for that user and removes library files we store. It does not automatically reverse a charge Polar already captured; use the portal or email us if you also need a refund review.",
      ],
    },
  ],
};
