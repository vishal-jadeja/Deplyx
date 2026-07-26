"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Cursor/scroll enhancements for the Deplyx landing page: Lenis smooth
 * scroll, anchor scrolling, hero cursor parallax, magnetic buttons, and
 * gallery center-focus. Scroll reveals and nav tint are pure CSS
 * (scroll-driven animation-timeline) so they aren't handled here.
 */
export function useDeplyxMotion(rootId: string) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = (
      target: EventTarget,
      ev: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions,
    ) => {
      target.addEventListener(ev, fn, opts);
      cleanups.push(() => target.removeEventListener(ev, fn, opts));
    };

    let lenis: Lenis | null = null;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const scrollToAnchor = (id: string) => {
      const target = id === "#top" ? root : (root.querySelector(id) ?? document.querySelector(id));
      if (!target) return;
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -20, duration: 1.4 });
      else (target as HTMLElement).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    };

    on(document, "click", (e) => {
      const el = e.target as HTMLElement;
      const a = el.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a || !root.contains(a)) return;
      const id = a.getAttribute("href");
      if (!id) return;
      e.preventDefault();
      scrollToAnchor(id);
    });

    if (reduce) {
      return () => {
        for (const fn of cleanups) fn();
      };
    }

    // ---- hero node + handles react to cursor ----
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    const node = root.querySelector<HTMLElement>("[data-hero-node]");
    const handles = Array.from(root.querySelectorAll<HTMLElement>("[data-handle]"));
    const handleBases = new WeakMap<HTMLElement, string>();

    if (hero && node) {
      on(hero, "mousemove", (e) => {
        const ev = e as MouseEvent;
        const r = node.getBoundingClientRect();
        const dx = (ev.clientX - (r.left + r.width / 2)) / 22;
        const dy = (ev.clientY - (r.top + r.height / 2)) / 22;
        node.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
        handles.forEach((h) => {
          if (!handleBases.has(h)) handleBases.set(h, h.style.transform);
          const base = handleBases.get(h) ?? "";
          const hr = h.getBoundingClientRect();
          const hcx = hr.left + hr.width / 2;
          const hcy = hr.top + hr.height / 2;
          const ddx = ev.clientX - hcx;
          const ddy = ev.clientY - hcy;
          const dist = Math.hypot(ddx, ddy);
          const pull = Math.max(0, 1 - dist / 260) * 10;
          const tx = (ddx / (dist || 1)) * pull;
          const ty = (ddy / (dist || 1)) * pull;
          h.style.transform = `${base} translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px)`;
        });
      });
      on(hero, "mouseleave", () => {
        node.style.transform = "translate(0,0)";
        handles.forEach((h) => {
          h.style.transform = handleBases.get(h) ?? "";
        });
      });
    }

    // ---- magnetic buttons ----
    root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
      on(btn, "mousemove", (e) => {
        const ev = e as MouseEvent;
        const r = btn.getBoundingClientRect();
        const dx = (ev.clientX - (r.left + r.width / 2)) / 2.6;
        const dy = (ev.clientY - (r.top + r.height / 2)) / 2.6;
        btn.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
      });
      on(btn, "mouseleave", () => {
        btn.style.transform = "translate(0,0)";
      });
    });

    // ---- features gallery: focus centered tile ----
    const gallery = root.querySelector<HTMLElement>("[data-gallery]");
    if (gallery) {
      const tiles = Array.from(gallery.querySelectorAll<HTMLElement>("[data-tile]"));
      const focusCenter = () => {
        const gr = gallery.getBoundingClientRect();
        const cx = gr.left + gr.width / 2;
        let best: HTMLElement | null = null;
        let bestD = Infinity;
        tiles.forEach((t) => {
          const r = t.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - cx);
          if (d < bestD) {
            bestD = d;
            best = t;
          }
        });
        tiles.forEach((t) => {
          if (t === best) {
            t.style.transform = "translateY(-8px) scale(1.02)";
            t.style.borderColor = "rgba(255,106,43,.45)";
            t.style.boxShadow = "0 30px 70px rgba(0,0,0,.5)";
            t.style.zIndex = "2";
          } else {
            t.style.transform = "scale(0.955)";
            t.style.boxShadow = "none";
            t.style.zIndex = "1";
          }
        });
      };
      on(gallery, "scroll", () => requestAnimationFrame(focusCenter), { passive: true });
      focusCenter();
    }

    return () => {
      for (const fn of cleanups) fn();
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [rootId]);
}
