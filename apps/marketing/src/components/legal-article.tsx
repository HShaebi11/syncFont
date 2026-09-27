import { LEGAL_BODY, LEGAL_EFFECTIVE, LEGAL_EMAIL, type LegalSlug } from "@/lib/legal";

export function LegalArticle({ slug, title }: { slug: LegalSlug; title: string }) {
  const blocks = LEGAL_BODY[slug];
  return (
    <article style={{ maxWidth: "40rem", padding: "2.5rem 1.5rem 1rem" }}>
      <p className="tf-kicker" style={{ margin: 0, color: "#737373" }}>
        Legal
      </p>
      <h1 className="tf-title" style={{ margin: "0.6rem 0 0" }}>
        {title}
      </h1>
      <p className="tf-meta" style={{ margin: "0.75rem 0 0", color: "#737373" }}>
        Effective {LEGAL_EFFECTIVE}. This is product documentation, not personal legal advice.
      </p>
      {blocks.map((block) => (
        <section key={block.heading} style={{ marginTop: "2rem" }}>
          <h2 className="tf-heading" style={{ margin: 0 }}>
            {block.heading}
          </h2>
          {block.body.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="tf-body"
              style={{
                margin: "0.7rem 0 0",
                color: "#d4d4d4",
              }}
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <p className="tf-meta" style={{ margin: "2.5rem 0 0", color: "#737373" }}>
        Contact{" "}
        <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: "#fff" }}>
          {LEGAL_EMAIL}
        </a>
        .
      </p>
    </article>
  );
}
