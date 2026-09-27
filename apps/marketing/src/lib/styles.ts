import type { CSSProperties } from "react";

export const primaryLink: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  background: "#000",
  padding: "0.625rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#fff",
  textDecoration: "none",
  border: "1px solid #000",
};

export const secondaryLink: CSSProperties = {
  ...primaryLink,
  background: "#fff",
  color: "#000",
  border: "1px solid #000",
};

export const disabledButton: CSSProperties = {
  ...secondaryLink,
  opacity: 0.45,
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
  background: "#000",
  color: "#fff",
};

export const siteNav: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  fontSize: "0.875rem",
};

export const navLink: CSSProperties = {
  color: "#a3a3a3",
  textDecoration: "none",
};

export const navLinkActive: CSSProperties = {
  ...navLink,
  color: "#fff",
  fontWeight: 500,
};
