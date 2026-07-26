import { eyebrow, mono } from "./theme";

export function FinalCta() {
  return (
    <section
      id="contact"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "12vh clamp(20px,5vw,64px)",
        borderTop: "1px solid var(--line-soft)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 1000,
          height: 800,
          maxWidth: "130vw",
          background: "radial-gradient(circle, rgba(255,106,43,.16) 0%, rgba(255,106,43,0) 60%)",
          pointerEvents: "none",
        }}
      />
      <div data-reveal style={{ ...eyebrow, marginBottom: 36 }}>
        — 07 / STOP GUESSING
      </div>
      <h2
        data-reveal
        data-reveal-delay="80"
        style={{
          margin: 0,
          position: "relative",
          fontWeight: 700,
          fontSize: "clamp(40px,8vw,128px)",
          lineHeight: 0.92,
          letterSpacing: "-.035em",
          maxWidth: 1200,
        }}
      >
        Stop shipping on
        <br />
        <span style={{ color: "var(--accent)", textShadow: "0 0 60px rgba(255,106,43,.4)" }}>
          borrowed time.
        </span>
      </h2>
      <a
        href="#top"
        data-magnetic
        className="dplx-cta"
        style={{
          marginTop: 56,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 40px",
          background: "var(--accent)",
          color: "#0a0908",
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: ".01em",
          borderRadius: 2,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0a0908" }} />
        Connect your GitHub
      </a>
      <p
        data-reveal
        data-reveal-delay="240"
        style={{
          marginTop: 22,
          fontFamily: mono,
          fontSize: 11,
          color: "var(--faint)",
          letterSpacing: ".05em",
        }}
      >
        read-only · no card · disconnect anytime
      </p>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        padding: "56px clamp(20px,5vw,64px) 40px",
        borderTop: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: ".24em",
          }}
        >
          <span style={{ width: 8, height: 8, background: "var(--accent)" }} />
          DEPLYX
        </div>
        <div
          style={{
            display: "flex",
            gap: "clamp(20px,4vw,48px)",
            fontSize: 13,
            color: "var(--text2)",
          }}
        >
          <a href="#intro" className="dplx-nav-link">
            Intro
          </a>
          <a href="#features" className="dplx-nav-link">
            Features
          </a>
          <a href="#product" className="dplx-nav-link">
            Product
          </a>
          <a href="#contact" className="dplx-nav-link">
            Contact
          </a>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1300,
          margin: "40px auto 0",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontFamily: mono,
          fontSize: 10.5,
          color: "var(--faintest)",
          letterSpacing: ".06em",
        }}
      >
        <span>◇ deplyx © 2026 — dependency integrity, measured</span>
        <span>fig. 07 — end of document · 1440 × ∞</span>
      </div>
    </footer>
  );
}
