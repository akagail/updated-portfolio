"use client";

import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect warns on the server — fall back to useEffect there so the
// dynamic gsap import only ever runs in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Phase 4.1 client wrapper — mounts the GSAP subtle-only hero entrance +
 * opacity-only scroll reveals.
 *
 * - Dynamic `import("../lib/animations")` keeps gsap/ScrollTrigger out of SSR.
 * - Bails early on `prefers-reduced-motion` (the lib re-checks after load).
 * - Kills all tweens + triggers on unmount via the lib's cleanup.
 * - Renders nothing; content stays visible if JS is disabled (progressive
 *   enhancement — initial states are only set from JS).
 */
export default function Reveal() {
  useIsomorphicLayoutEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        if (
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        const { initPageAnimations } = await import("../lib/animations");
        if (cancelled) return;
        cleanup = await initPageAnimations();
      } catch {
        // Animation is decorative — leave content untouched and visible.
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
