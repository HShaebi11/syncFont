import type { ReactNode } from "react";

import { AuthSplitLayout } from "@/components/auth/auth-split";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <AuthSplitLayout title={title} description={description}>
      <div className="auth-form">{children}</div>
    </AuthSplitLayout>
  );
}

export const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: "var(--tf-step-0)",
  fontWeight: 400,
  marginBottom: "0.375rem",
  color: "#a3a3a3",
};

export const fieldInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.75rem 1rem",
  borderRadius: "999px",
  border: "1px solid #525252",
  background: "transparent",
  color: "#fff",
  fontSize: "var(--tf-step-1)",
};

export const primaryButton: React.CSSProperties = {
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.85rem 1.4rem",
  borderRadius: "999px",
  border: "none",
  background: "#fff",
  color: "#000",
  fontSize: "var(--tf-step-1)",
  fontWeight: 400,
  cursor: "pointer",
};

export const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: "transparent",
  color: "#fff",
  border: "1px solid #fff",
};

export const errorText: React.CSSProperties = {
  color: "#fca5a5",
  fontSize: "0.875rem",
  margin: "0.5rem 0 0",
};

export const mutedLink: React.CSSProperties = {
  color: "#737373",
  fontSize: "0.875rem",
  marginTop: "1rem",
};
