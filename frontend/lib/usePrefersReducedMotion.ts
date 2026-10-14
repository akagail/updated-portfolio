"use client";

import { useEffect, useState } from "react";

/**
 * Phase 4.1 — returns true when the user prefers reduced motion.
 * Lenis smooth-scroll / gsap subtle reveal initialisation must bail out
 * early when this is true (CSS `prefers-reduced-motion` guard in
 * `app/globals.css` already covers scroll-behavior + transitions).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
