"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll provider — synchronised with GSAP ScrollTrigger.
 *
 * - One scroll system: Lenis drives window scrolling from the GSAP ticker, and
 *   ScrollTrigger listens to Lenis (`lenis.on("scroll", ScrollTrigger.update)`)
 *   so pinned/scrubbed sections (the 3D project carousel) stay perfectly in
 *   sync with the smoothed scroll position.
 * - `anchors: true` keeps native anchor markup working (#section clicks).
 * - Disabled for `prefers-reduced-motion` and coarse pointers so touch
 *   scrolling stays native-feeling; ScrollTrigger still works with native
 *   scrolling when Lenis is off.
 * - rAF is owned by gsap.ticker; everything is torn down on unmount.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    if (reduced.matches || coarse.matches) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ anchors: true, lerp: 0.1, syncTouch: false });

      // Lenis raf driven by the gsap ticker; ScrollTrigger follows Lenis.
      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };
      const onScroll = () => {
        ScrollTrigger.update();
      };

      lenis.on("scroll", onScroll);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      dispose = () => {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return null;
}

