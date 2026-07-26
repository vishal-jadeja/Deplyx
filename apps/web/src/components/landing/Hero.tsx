import Image from "next/image";
import heroSphere from "./assets/hero-sphere.png";
import particles from "./assets/particles.png";
import { mono } from "./theme";

export function Hero() {
  return (
    <section
      id="top"
      data-hero
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(100px,12vh,140px) clamp(20px,5vw,64px) clamp(80px,10vh,110px)",
        overflow: "visible",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          maxWidth: "120vw",
          background: "radial-gradient(circle, rgba(255,106,43,.16) 0%, rgba(255,106,43,0) 62%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-30%",
          right: "-10%",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(120,80,255,.06) 0%, rgba(120,80,255,0) 60%)",
          pointerEvents: "none",
        }}
      />
      <Image
        src={particles}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", mixBlendMode: "screen", opacity: 0.55, pointerEvents: "none" }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          data-reveal
          data-reveal-delay="80"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "clamp(44px,8.4vw,124px)",
            lineHeight: 0.92,
            letterSpacing: "-.035em",
          }}
        >
          Your dependencies
          <br />
          are rotting<span style={{ color: "var(--accent)" }}>.</span>
        </h1>
        <p
          data-reveal
          data-reveal-delay="220"
          style={{
            margin: "clamp(20px,3vw,32px) 0 0",
            maxWidth: 540,
            fontSize: "clamp(15px,1.5vw,19px)",
            lineHeight: 1.5,
            color: "var(--text2)",
          }}
        >
          DEPLYX scans your codebase, detects deprecated and abandoned packages, and helps you stay
          ahead of risk.
        </p>

        <div
          data-hero-viz
          style={{
            position: "relative",
            width: "min(560px,82vw)",
            height: "min(560px,82vw)",
            aspectRatio: "1",
            margin: "clamp(20px,3vw,40px) auto 0",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 26,
              height: 26,
              borderTop: "1.5px solid var(--line3)",
              borderLeft: "1.5px solid var(--line3)",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 26,
              height: 26,
              borderTop: "1.5px solid var(--line3)",
              borderRight: "1.5px solid var(--line3)",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 26,
              height: 26,
              borderBottom: "1.5px solid var(--line3)",
              borderLeft: "1.5px solid var(--line3)",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 26,
              height: 26,
              borderBottom: "1.5px solid var(--line3)",
              borderRight: "1.5px solid var(--line3)",
            }}
          />

          <div
            data-reveal
            data-reveal-delay="360"
            style={{
              position: "absolute",
              top: "50%",
              left: "6%",
              right: "6%",
              height: 1,
              borderTop: "1px dashed var(--line3)",
            }}
          />
          <div
            data-reveal
            data-reveal-delay="360"
            style={{
              position: "absolute",
              left: "50%",
              top: "6%",
              bottom: "6%",
              width: 1,
              borderLeft: "1px dashed var(--line3)",
            }}
          />

          <div
            data-reveal
            data-reveal-delay="420"
            style={{
              position: "absolute",
              inset: "11%",
              borderRadius: "50%",
              border: "1px dashed var(--line3)",
            }}
          />

          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "20%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 58% 42%, rgba(255,138,43,.55), rgba(255,106,43,.12) 45%, rgba(255,106,43,0) 70%)",
              filter: "blur(12px)",
              pointerEvents: "none",
            }}
          />

          <div
            data-hero-node
            style={{
              position: "absolute",
              inset: "27%",
              borderRadius: "50%",
              transition: "transform .35s cubic-bezier(.16,1,.3,1)",
              animation: "dplx-float 6.5s ease-in-out infinite",
              boxShadow: "0 0 70px rgba(255,106,43,.28),inset 0 0 60px rgba(0,0,0,.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.05)",
              }}
            >
              <Image
                src={heroSphere}
                alt="A cratered, molten planet representing a decaying package"
                fill
                priority
                sizes="(min-width: 640px) 560px, 82vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                boxShadow: "inset -6px -6px 30px rgba(255,120,40,.35)",
                pointerEvents: "none",
              }}
            />
          </div>

          <span
            data-handle
            style={{
              position: "absolute",
              top: "6%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 14,
              height: 14,
              background: "var(--accent)",
              boxShadow: "0 0 14px rgba(255,106,43,.5)",
            }}
          />
          <span
            data-handle
            style={{
              position: "absolute",
              bottom: "6%",
              left: "50%",
              transform: "translate(-50%,50%)",
              width: 14,
              height: 14,
              background: "var(--accent)",
              boxShadow: "0 0 14px rgba(255,106,43,.5)",
            }}
          />
          <span
            data-handle
            style={{
              position: "absolute",
              top: "50%",
              left: "6%",
              transform: "translate(-50%,-50%)",
              width: 14,
              height: 14,
              background: "var(--accent)",
              boxShadow: "0 0 14px rgba(255,106,43,.5)",
            }}
          />
          <span
            data-handle
            style={{
              position: "absolute",
              top: "50%",
              right: "6%",
              transform: "translate(50%,-50%)",
              width: 14,
              height: 14,
              background: "var(--accent)",
              boxShadow: "0 0 14px rgba(255,106,43,.5)",
            }}
          />

          <div
            data-reveal
            data-reveal-delay="560"
            style={{
              position: "absolute",
              top: "calc(50% - 40px)",
              left: "6%",
              textAlign: "left",
              fontFamily: mono,
              fontSize: 11,
              lineHeight: 1.5,
              color: "var(--text2)",
              letterSpacing: ".02em",
            }}
          >
            pkg: left-pad
            <br />
            v1.3.0 · <span style={{ color: "var(--accent)" }}>deprecated</span>
          </div>
          <div
            data-reveal
            data-reveal-delay="600"
            style={{
              position: "absolute",
              top: "calc(50% - 40px)",
              right: "6%",
              textAlign: "left",
              fontFamily: mono,
              fontSize: 11,
              lineHeight: 1.5,
              color: "var(--text2)",
              letterSpacing: ".02em",
            }}
          >
            last publish
            <br />
            <span style={{ color: "var(--accent)" }}>3 years ago</span>
          </div>
          <div
            data-reveal
            data-reveal-delay="660"
            style={{
              position: "absolute",
              bottom: "16%",
              right: "8%",
              textAlign: "left",
              fontFamily: mono,
              fontSize: 11,
              lineHeight: 1.5,
              color: "var(--text2)",
              letterSpacing: ".02em",
              paddingLeft: 14,
              borderLeft: "1px solid var(--line3)",
            }}
          >
            risk score
            <br />
            <span style={{ color: "var(--accent)" }}>78 / 100</span>
          </div>
        </div>
      </div>

      <a
        href="#intro"
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: ".28em",
          color: "var(--faint)",
        }}
      >
        <span>SCROLL TO CONTINUE</span>
        <span
          style={{ fontSize: 16, lineHeight: 1, animation: "dplx-cue 2.2s ease-in-out infinite" }}
        >
          ⌄
        </span>
      </a>
    </section>
  );
}
