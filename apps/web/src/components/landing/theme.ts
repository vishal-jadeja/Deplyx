import type { CSSProperties } from "react";

/** Custom properties aren't in React's CSSProperties type — cast at the edge. */
export type Vars = CSSProperties & Record<`--${string}`, string | number>;

export const rootVars: Vars = {
  "--accent": "#ff6a2b",
  "--bg": "#0a0908",
  "--bg-2": "#1a130d",
  "--text": "#e8e4dc",
  "--text2": "#a49c92",
  "--faint": "#6b645c",
  "--faintest": "#5a544c",
  "--line": "rgba(255,255,255,.07)",
  "--line2": "rgba(255,255,255,.1)",
  "--line3": "rgba(255,255,255,.18)",
  "--line-soft": "rgba(255,255,255,.06)",
  "--line-08": "rgba(255,255,255,.08)",
  "--card": "rgba(255,255,255,.04)",
  "--card2": "rgba(255,255,255,.03)",
  "--card3": "rgba(255,255,255,.02)",
  "--card4": "rgba(255,255,255,.012)",
  "--nav-tint": "rgba(10,9,8,0.72)",
  "--nav-border": "rgba(255,255,255,.07)",
  position: "relative",
  width: "100%",
  overflow: "hidden",
  background: "radial-gradient(120% 80% at 50% -10%, var(--bg-2) 0%, var(--bg) 55%)",
  color: "var(--text)",
  fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
};

export const mono = "var(--font-jetbrains-mono), monospace";

export const eyebrow: CSSProperties = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: ".14em",
  color: "var(--faint)",
};
