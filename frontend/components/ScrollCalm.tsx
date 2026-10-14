"use client";

import { useEffect } from "react";

/**
 * Scroll performance guard for refractive bubbles.
 *
 * Backdrop displacement is the page's most expensive paint work. While the
 * user scrolls (Lenis glide included — native scroll events still fire),
 * bubbles fall back to plain glass; full refraction returns ~220ms after
 * the last scroll event. Decorative-only, passive listener, full cleanup.
 */
export default function ScrollCalm() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const onScroll = () => {
      document.documentElement.dataset.scrolling = "true";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete document.documentElement.dataset.scrolling;
      }, 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      delete document.documentElement.dataset.scrolling;
    };
  }, []);

  return null;
}
