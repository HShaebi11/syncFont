import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalArticle } from "@/components/legal-article";
import { LEGAL_PAGES, isLegalSlug } from "@/lib/legal";

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES.find((item) => item.slug === slug);
  if (!page) {
    return { title: "Legal — Typefolio" };
  }
  return {
    title: `${page.title} — Typefolio`,
    description: page.description,
  };
}

export default async function LegalSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    notFound();
  }
  const page = LEGAL_PAGES.find((item) => item.slug === slug);
  if (!page) {
    notFound();
  }
  return <LegalArticle slug={slug} title={page.title} />;
}
