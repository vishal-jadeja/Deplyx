import type { CSSProperties } from "react";
import { eyebrow, mono } from "./theme";

const cornerBase: CSSProperties = {
  position: "absolute",
  width: 11,
  height: 11,
  background: "var(--bg)",
  border: "1.5px solid var(--accent)",
  zIndex: 3,
};
const cornerTL: CSSProperties = { ...cornerBase, top: -6, left: -6 };
const cornerTR: CSSProperties = { ...cornerBase, top: -6, right: -6 };
const cornerBL: CSSProperties = { ...cornerBase, bottom: -6, left: -6 };
const cornerBR: CSSProperties = { ...cornerBase, bottom: -6, right: -6 };

const severities = [
  { label: "CRITICAL", color: "#ff6a5a", count: 8, pct: 64, bar: "#ff4d3d" },
  { label: "HIGH", color: "#ffab6a", count: 17, pct: 82, bar: "#ff8a3d" },
  { label: "MEDIUM", color: "#e6c463", count: 23, pct: 48, bar: "#e0b341" },
  { label: "LOW", color: "#7fd6a2", count: 31, pct: 26, bar: "#5a9e8f" },
];

export function ProductPreview() {
  return (
    <section
      id="product"
      style={{
        position: "relative",
        padding: "12vh clamp(20px,5vw,64px)",
        borderTop: "1px solid var(--line-soft)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div data-reveal style={{ ...eyebrow, marginBottom: 14 }}>
          — 05 / THE DASHBOARD
        </div>
        <h2
          data-reveal
          data-reveal-delay="80"
          style={{
            margin: "0 0 48px",
            fontWeight: 700,
            fontSize: "clamp(30px,4.5vw,60px)",
            lineHeight: 1,
            letterSpacing: "-.02em",
            maxWidth: 840,
          }}
        >
          Every repo, measured.
        </h2>

        <div data-reveal data-reveal-delay="160" style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: -24,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              fontFamily: mono,
              fontSize: 10,
              color: "var(--faint)",
              letterSpacing: ".06em",
            }}
          >
            <span>◇ deplyx / dashboard</span>
            <span>1280 × 720</span>
          </div>
          <span style={cornerTL} />
          <span style={cornerTR} />
          <span style={cornerBL} />
          <span style={cornerBR} />

          <div
            style={{
              border: "1px solid var(--line2)",
              background: "linear-gradient(180deg,#100d0a,#0c0a08)",
              boxShadow: "0 40px 100px rgba(0,0,0,.5)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", gap: 7 }}>
                <span
                  style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a2622" }}
                />
                <span
                  style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a2622" }}
                />
                <span
                  style={{ width: 11, height: 11, borderRadius: "50%", background: "#2a2622" }}
                />
              </div>
              <span style={{ fontFamily: mono, fontSize: 12, color: "#8a827a" }}>
                app.deplyx.io / overview
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#7fd6a2",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7fd6a2" }} />
                synced
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)" }}>
              <div style={{ padding: 24, borderRight: "1px solid var(--line)" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 18,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".02em" }}>
                    Repositories
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: "var(--faint)" }}>
                    12 connected
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: 14,
                      background: "var(--card3)",
                      border: "1px solid var(--line-soft)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>acme/payments-api</div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: "var(--faint)",
                          marginTop: 3,
                        }}
                      >
                        Go · 340 deps
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, fontFamily: mono, fontSize: 11 }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(255,77,61,.14)",
                          color: "#ff6a5a",
                          border: "1px solid rgba(255,77,61,.3)",
                        }}
                      >
                        4 CRIT
                      </span>
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(255,138,61,.12)",
                          color: "#ffab6a",
                          border: "1px solid rgba(255,138,61,.28)",
                        }}
                      >
                        9 HIGH
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: 14,
                      background: "rgba(255,106,43,.05)",
                      border: "1px solid rgba(255,106,43,.25)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        acme/ml-inference{" "}
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 9,
                            color: "var(--accent)",
                            border: "1px solid rgba(255,106,43,.4)",
                            padding: "1px 5px",
                          }}
                        >
                          SELECTED
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: "var(--faint)",
                          marginTop: 3,
                        }}
                      >
                        Python · 218 deps · 2 models
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, fontFamily: mono, fontSize: 11 }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(255,77,61,.14)",
                          color: "#ff6a5a",
                          border: "1px solid rgba(255,77,61,.3)",
                        }}
                      >
                        2 CRIT
                      </span>
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(224,179,65,.12)",
                          color: "#e6c463",
                          border: "1px solid rgba(224,179,65,.28)",
                        }}
                      >
                        5 MED
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: 14,
                      background: "var(--card3)",
                      border: "1px solid var(--line-soft)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>acme/web-dashboard</div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: "var(--faint)",
                          marginTop: 3,
                        }}
                      >
                        TypeScript · 1,204 deps
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, fontFamily: mono, fontSize: 11 }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          background: "rgba(90,158,143,.12)",
                          color: "#7fd6a2",
                          border: "1px solid rgba(90,158,143,.28)",
                        }}
                      >
                        CLEAN
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    border: "1px dashed var(--line3)",
                    background: "rgba(0,0,0,.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: 12 }}>
                      requests <span style={{ color: "#ff6a5a" }}>2.19.1</span>
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: "#ff6a5a",
                        border: "1px solid rgba(255,77,61,.3)",
                        padding: "2px 7px",
                        background: "rgba(255,77,61,.1)",
                      }}
                    >
                      CRITICAL · CVE-2024-XXXX
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      lineHeight: 1.7,
                      background: "rgba(0,0,0,.3)",
                      padding: "12px 14px",
                      borderLeft: "2px solid var(--accent)",
                    }}
                  >
                    <div
                      style={{
                        color: "#ff8a7a",
                        background: "rgba(255,77,61,.08)",
                        margin: "0 -14px",
                        padding: "0 14px",
                      }}
                    >
                      - requests==2.19.1
                    </div>
                    <div
                      style={{
                        color: "#7fd6a2",
                        background: "rgba(90,200,140,.08)",
                        margin: "0 -14px",
                        padding: "0 14px",
                      }}
                    >
                      + requests==2.32.3
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <span
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: 9,
                        background: "var(--accent)",
                        color: "#0a0908",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Apply fix · open PR
                    </span>
                    <span
                      style={{
                        padding: "9px 16px",
                        border: "1px solid var(--line3)",
                        fontSize: 12,
                        color: "var(--text2)",
                      }}
                    >
                      Snooze
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".02em" }}>
                  Issues by severity
                </span>
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                  {severities.map((s) => (
                    <div key={s.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontFamily: mono,
                          fontSize: 11,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: s.color }}>{s.label}</span>
                        <span style={{ color: "var(--text)" }}>{s.count}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line-soft)" }}>
                        <div style={{ width: `${s.pct}%`, height: "100%", background: s.bar }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: "var(--faint)",
                      marginBottom: 6,
                    }}
                  >
                    TOTAL EXPOSURE
                  </div>
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                      lineHeight: 1,
                    }}
                  >
                    79{" "}
                    <span style={{ fontSize: 14, color: "var(--faint)", fontWeight: 400 }}>
                      issues
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontFamily: mono, fontSize: 11, color: "#7fd6a2" }}>
                    ↓ 34% since last week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
