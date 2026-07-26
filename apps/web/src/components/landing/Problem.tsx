import { eyebrow, mono } from "./theme";

export function Problem() {
  return (
    <section
      id="intro"
      style={{
        position: "relative",
        minHeight: "96vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "14vh clamp(20px,5vw,64px)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 900,
          height: 600,
          maxWidth: "120vw",
          background: "radial-gradient(circle, rgba(255,106,43,.08) 0%, rgba(255,106,43,0) 65%)",
          pointerEvents: "none",
        }}
      />
      <div data-reveal style={{ ...eyebrow, marginBottom: 32 }}>
        — 02 / THE PROBLEM
      </div>
      <h2
        style={{
          margin: 0,
          maxWidth: 1200,
          fontWeight: 700,
          fontSize: "clamp(38px,8vw,120px)",
          lineHeight: 0.96,
          letterSpacing: "-.03em",
        }}
      >
        <span data-reveal style={{ display: "block" }}>
          It breaks <span style={{ color: "var(--faint)" }}>silently.</span>
        </span>
        <span data-reveal data-reveal-delay="160" style={{ display: "block" }}>
          It breaks in{" "}
          <span style={{ color: "var(--accent)", textShadow: "0 0 40px rgba(255,106,43,.5)" }}>
            prod.
          </span>
        </span>
      </h2>
      <p
        data-reveal
        data-reveal-delay="320"
        style={{
          margin: "48px 0 0",
          maxWidth: 520,
          fontSize: "clamp(15px,1.5vw,18px)",
          lineHeight: 1.55,
          color: "var(--text2)",
        }}
      >
        A transitive package gets yanked. A maintainer&rsquo;s token gets compromised. A model ID
        gets sunset. You find out from a 3&thinsp;a.m. page — not a changelog.
      </p>
    </section>
  );
}

const steps = [
  {
    n: "STEP 01",
    title: "Connect GitHub",
    body: "One OAuth click. Read-only access to your org and personal repos. No CI changes, no config files to babysit.",
    delay: 0,
  },
  {
    n: "STEP 02",
    title: "Deplyx scans every repo",
    body: "Lockfiles, manifests, and source are parsed across every ecosystem — then cross-referenced against advisory feeds, EOL calendars, and model registries.",
    delay: 120,
  },
  {
    n: "STEP 03",
    title: "Get ranked fixes",
    body: "Every issue sorted by severity with a generated diff. Review, approve, and Deplyx opens the PR. Ship the fix, not the incident.",
    delay: 240,
  },
];

export function HowItWorks() {
  return (
    <section
      style={{
        position: "relative",
        padding: "12vh clamp(20px,5vw,64px)",
        borderTop: "1px solid var(--line-soft)",
      }}
    >
      <div data-reveal style={{ ...eyebrow, marginBottom: 14 }}>
        — 03 / HOW IT WORKS
      </div>
      <h2
        data-reveal
        data-reveal-delay="80"
        style={{
          margin: "0 0 64px",
          fontWeight: 700,
          fontSize: "clamp(30px,4.5vw,60px)",
          lineHeight: 1,
          letterSpacing: "-.02em",
          maxWidth: 900,
        }}
      >
        Three steps. Zero config. It just watches.
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "clamp(16px,2vw,28px)",
          maxWidth: 1300,
        }}
      >
        {steps.map((step) => (
          <div
            key={step.n}
            data-reveal
            data-reveal-delay={step.delay || undefined}
            className="dplx-step"
            style={{
              position: "relative",
              padding: "32px 28px 40px",
              background: "linear-gradient(180deg,var(--card2),var(--card4))",
              border: "1px solid var(--line)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                width: 12,
                height: 12,
                borderTop: "1.5px solid var(--accent)",
                borderLeft: "1.5px solid var(--accent)",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                width: 12,
                height: 12,
                borderBottom: "1.5px solid var(--accent)",
                borderRight: "1.5px solid var(--accent)",
              }}
            />
            <div
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: "var(--accent)",
                letterSpacing: ".1em",
                marginBottom: 44,
              }}
            >
              {step.n}
            </div>
            <h3
              style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 600, letterSpacing: "-.01em" }}
            >
              {step.title}
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text2)" }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
