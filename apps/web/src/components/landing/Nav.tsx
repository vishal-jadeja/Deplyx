export function Nav() {
  return (
    <nav
      data-nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px clamp(20px,5vw,64px)",
        background: "transparent",
        borderBottom: "1px solid transparent",
        transition:
          "background .5s ease, padding .5s ease, border-color .5s ease, backdrop-filter .5s ease",
      }}
    >
      <a
        href="#top"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: ".24em",
          color: "var(--text)",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            background: "var(--accent)",
            display: "inline-block",
            boxShadow: "0 0 14px var(--accent)",
          }}
        />
        DEPLYX
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: "clamp(18px,3vw,40px)" }}>
        <div
          style={{
            display: "flex",
            gap: "clamp(16px,2.4vw,34px)",
            fontSize: 13,
            letterSpacing: ".04em",
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
        <a
          href="#contact"
          data-magnetic
          className="dplx-btn-outline"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "11px 20px",
            border: "1px solid var(--line3)",
            borderRadius: 10,
            fontSize: 13,
            letterSpacing: ".02em",
            fontWeight: 500,
            color: "var(--text)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Connect GitHub
        </a>
      </div>
    </nav>
  );
}
