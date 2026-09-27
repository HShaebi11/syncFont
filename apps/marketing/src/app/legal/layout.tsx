import { LegalFooter, LegalHeader } from "@/components/legal-chrome";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <LegalHeader />
      <div style={{ flex: 1 }}>{children}</div>
      <LegalFooter />
    </div>
  );
}
