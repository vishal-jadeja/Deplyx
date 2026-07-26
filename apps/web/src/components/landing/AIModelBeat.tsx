import { eyebrow, mono } from "./theme";

export function AIModelBeat() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "12vh clamp(20px,5vw,64px)",
        borderTop: "1px solid var(--line-soft)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "40%",
          right: "-5%",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(255,106,43,.1) 0%, rgba(255,106,43,0) 62%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div data-reveal style={{ ...eyebrow, marginBottom: 28 }}>
          — 06 / AI MODELS DIE TOO
        </div>
        <h2
          data-reveal
          data-reveal-delay="80"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "clamp(34px,6vw,88px)",
            lineHeight: 0.98,
            letterSpacing: "-.03em",
            maxWidth: 1000,
          }}
        >
          The model you shipped on has a{" "}
          <span style={{ color: "var(--accent)" }}>shutdown date.</span>
        </h2>

        <div data-reveal data-reveal-delay="220" style={{ marginTop: 56, maxWidth: 720 }}>
          <div
            style={{
              position: "relative",
              fontFamily: mono,
              background: "#0d0b09",
              border: "1px solid var(--line2)",
              boxShadow: "0 30px 70px rgba(0,0,0,.5)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -5,
                left: -5,
                width: 10,
                height: 10,
                background: "var(--bg)",
                border: "1.5px solid var(--accent)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                width: 10,
                height: 10,
                background: "var(--bg)",
                border: "1.5px solid var(--accent)",
              }}
            />
            <div
              style={{
                padding: "11px 16px",
                borderBottom: "1px solid var(--line)",
                fontSize: 11,
                color: "var(--faint)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>services/llm_client.py</span>
              <span style={{ color: "#ff6a5a" }}>1 issue</span>
            </div>
            <div style={{ padding: "20px 20px", fontSize: 14, lineHeight: 1.9 }}>
              <div style={{ color: "var(--faint)" }}>
                {"  "}
                <span style={{ color: "var(--text2)" }}>client</span> = OpenAI()
              </div>
              <div
                style={{
                  background: "rgba(255,77,61,.09)",
                  margin: "0 -20px",
                  padding: "0 20px",
                  color: "#ff8a7a",
                }}
              >
                - <span style={{ color: "#c9c2b8" }}>model</span>=
                <span style={{ color: "#ff8a7a" }}>&quot;gpt-4-0314&quot;</span>{" "}
                <span style={{ color: "#ff6a5a" }}>← sunset 2025-06-13</span>
              </div>
              <div
                style={{
                  background: "rgba(90,200,140,.09)",
                  margin: "0 -20px",
                  padding: "0 20px",
                  color: "#7fd6a2",
                }}
              >
                + <span style={{ color: "#c9c2b8" }}>model</span>=
                <span style={{ color: "#7fd6a2" }}>&quot;gpt-4o-2024-11-20&quot;</span>
              </div>
              <div style={{ color: "var(--faint)" }}>
                {"  "}
                <span style={{ color: "var(--text2)" }}>response</span> =
                client.chat.completions.create(...)
              </div>
            </div>
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: "dplx-pulse 1.8s infinite",
                }}
              />
              <span style={{ color: "var(--text2)" }}>
                Deplyx detected a discontinued model and drafted the swap.
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "7px 14px",
                  background: "var(--accent)",
                  color: "#0a0908",
                  fontWeight: 600,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                }}
              >
                Apply
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
