export function TypeSpecimen() {
  return (
    <aside
      className="auth-specimen"
      aria-hidden="true"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#fff",
        color: "#000",
        minWidth: 0,
        height: "100%",
      }}
    >
      <p
        className="tf-specimen-aa"
        style={{
          margin: 0,
          position: "absolute",
          top: "-4%",
          left: "-4%",
          color: "#000",
          userSelect: "none",
        }}
      >
        Aa
      </p>
      <p
        className="tf-specimen-num"
        style={{
          margin: 0,
          position: "absolute",
          bottom: "8%",
          right: "-2%",
          color: "#000",
          userSelect: "none",
        }}
      >
        123
      </p>
      <p
        className="tf-specimen-meta"
        style={{
          margin: 0,
          position: "absolute",
          top: "52%",
          left: "10%",
          color: "#000",
          userSelect: "none",
        }}
      >
        .ttf  .otf  .woff2
      </p>
    </aside>
  );
}
