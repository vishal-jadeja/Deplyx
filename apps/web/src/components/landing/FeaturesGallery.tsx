import type { CSSProperties } from "react";
import { eyebrow, mono } from "./theme";

const tileStyle: CSSProperties = {
  scrollSnapAlign: "center",
  flex: "0 0 clamp(260px,32vw,380px)",
  position: "relative",
  padding: "30px 28px",
  height: "clamp(300px,34vw,400px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "linear-gradient(160deg,var(--card),var(--card4))",
  border: "1px solid var(--line-08)",
  transition: "transform .5s cubic-bezier(.16,1,.3,1),border-color .5s,box-shadow .5s",
};

const tagStyle: CSSProperties = {
  fontFamily: mono,
  fontSize: 11,
  color: "var(--accent)",
  letterSpacing: ".1em",
};

export function FeaturesGallery() {
  return (
    <section
      id="features"
      style={{
        position: "relative",
        padding: "12vh 0",
        borderTop: "1px solid var(--line-soft)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "0 clamp(20px,5vw,64px)", marginBottom: 48 }}>
        <div data-reveal style={{ ...eyebrow, marginBottom: 14 }}>
          — 04 / CAPABILITIES
        </div>
        <h2
          data-reveal
          data-reveal-delay="80"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "clamp(30px,4.5vw,60px)",
            lineHeight: 1,
            letterSpacing: "-.02em",
            maxWidth: 900,
          }}
        >
          Everything it watches for you.
        </h2>
        <p
          data-reveal
          data-reveal-delay="160"
          style={{
            margin: "20px 0 0",
            fontFamily: mono,
            fontSize: 11,
            color: "var(--faint)",
            letterSpacing: ".06em",
          }}
        >
          drag or scroll horizontally →
        </p>
      </div>

      <div
        data-gallery
        style={{
          display: "flex",
          gap: 22,
          padding: "12px clamp(20px,5vw,64px) 40px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        <div data-tile style={tileStyle}>
          <div>
            <div style={tagStyle}>01 · SCAN</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Multi-ecosystem
              <br />
              scanning
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              npm, PyPI, Go modules, Cargo, Maven — one graph across every language in your
              monorepo.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              fontFamily: mono,
              fontSize: 11,
              color: "#8a827a",
            }}
          >
            {["npm", "pip", "go", "cargo", "maven"].map((eco) => (
              <span key={eco} style={{ padding: "5px 9px", border: "1px solid var(--line2)" }}>
                {eco}
              </span>
            ))}
          </div>
        </div>

        <div data-tile style={tileStyle}>
          <div>
            <div style={tagStyle}>02 · THREAT</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Compromised-
              <br />
              package detection
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              Typosquats, malicious post-install scripts, and hijacked maintainer releases caught
              the hour they land.
            </p>
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: "#ff5e4d",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#ff5e4d",
                animation: "dplx-pulse 1.6s infinite",
              }}
            />
            3 supply-chain alerts this week
          </div>
        </div>

        <div
          data-tile
          style={{
            ...tileStyle,
            background: "linear-gradient(160deg,rgba(255,106,43,.09),var(--card4))",
            border: "1px solid rgba(255,106,43,.2)",
          }}
        >
          <div>
            <div style={tagStyle}>03 · AI</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              AI model
              <br />
              deprecation tracking
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#c9c2b8" }}>
              Every model ID in your code checked against provider EOL schedules. Sunset dates
              flagged before the endpoint 404s.
            </p>
          </div>
          <div style={{ fontFamily: mono, fontSize: 11.5, color: "var(--text2)", lineHeight: 1.6 }}>
            <span style={{ color: "#ff5e4d" }}>gpt-4-0314</span> → sunset 06-13
            <br />
            <span style={{ color: "#7fd6a2" }}>gpt-4o</span> suggested
          </div>
        </div>

        <div data-tile style={tileStyle}>
          <div>
            <div style={tagStyle}>04 · TRIAGE</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Severity
              <br />
              classification
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              Reachability-aware scoring. A CVE in dead code isn&rsquo;t Critical — Deplyx knows the
              difference.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 44 }}>
            <span style={{ flex: 1, height: "100%", background: "#ff4d3d", opacity: 0.85 }} />
            <span style={{ flex: 1, height: "72%", background: "#ff8a3d", opacity: 0.85 }} />
            <span style={{ flex: 1, height: "48%", background: "#e0b341", opacity: 0.85 }} />
            <span style={{ flex: 1, height: "26%", background: "#5a9e8f", opacity: 0.85 }} />
          </div>
        </div>

        <div data-tile style={tileStyle}>
          <div>
            <div style={tagStyle}>05 · FIX</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Auto-generated
              <br />
              fix diffs
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              One-click PRs with the version bump, the migration note, and the changelog delta
              already written.
            </p>
          </div>
          <div style={{ fontFamily: mono, fontSize: 11.5, lineHeight: 1.7 }}>
            <span style={{ color: "#ff8a7a" }}>- react@17.0.2</span>
            <br />
            <span style={{ color: "#7fd6a2" }}>+ react@18.3.1</span>
          </div>
        </div>

        <div data-tile style={tileStyle}>
          <div>
            <div style={tagStyle}>06 · WATCH</div>
            <h3
              style={{
                margin: "18px 0 12px",
                fontSize: 26,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Continuous
              <br />
              monitoring
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              The graph never sleeps. New advisory, new EOL date, new commit — you get the delta,
              not another dashboard to check.
            </p>
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11.5,
              color: "#7fd6a2",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7fd6a2" }} />
            watching · synced 40s ago
          </div>
        </div>
      </div>
    </section>
  );
}
