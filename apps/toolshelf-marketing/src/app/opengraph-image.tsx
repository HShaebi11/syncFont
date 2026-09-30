import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Toolshelf — sharp utilities for people who make things";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0c0b0a",
          color: "#f4f1eb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontSize: 28, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a9488" }}>
          Toolshelf
        </p>
        <p
          style={{
            marginTop: 24,
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          A shelf of sharp utilities for people who make things.
        </p>
      </div>
    ),
    { ...size },
  );
}
