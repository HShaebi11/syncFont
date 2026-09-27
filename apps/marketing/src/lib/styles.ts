import type { CSSProperties } from "react";

export const primaryLink: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  background: "#171717",
  padding: "0.625rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#fff",
  textDecoration: "none",
};

export const secondaryLink: CSSProperties = {
  ...primaryLink,
  background: "#fff",
  color: "#171717",
  border: "1px solid #d4d4d4",
};

export const disabledButton: CSSProperties = {
  ...secondaryLink,
  opacity: 0.55,
  cursor: "not-allowed",
  pointerEvents: "none",
};

export const pageShell: CSSProperties = {
  margin: "0 auto",
  display: "flex",
  minHeight: "100vh",
  maxWidth: "48rem",
  flexDirection: "column",
  gap: "2rem",
  padding: "3rem 1.5rem 5rem",
};

export const siteNav: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  fontSize: "0.875rem",
};

export const navLink: CSSProperties = {
  color: "#525252",
  textDecoration: "none",
};

export const navLinkActive: CSSProperties = {
  ...navLink,
  color: "#171717",
  fontWeight: 500,
};
