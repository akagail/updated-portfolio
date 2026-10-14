/**
 * Subtle GSAP hero entrance + scroll reveals.
 *
 * - Targets existing `data-hero` / `data-reveal` attributes (no markup changes).
 * - Progressive enhancement: initial states are set from JS (`gsap.from` /
 *   `gsap.set`) so content stays fully visible with JS disabled or if the
 *   dynamic import fails.
 * - Subtle-only by design: hero is small y12 drift + fade (0.5s); scroll
 *   reveals are y16 + fade over 0.6s with a gentle stagger.
 * - Skips everything when the user prefers reduced motion.
 * - The returned cleanup kills all tweens + ScrollTriggers (call on unmount).
 *
 * Never import `gsap` statically from a server component — always reach this
 * module through a client wrapper (`components/Reveal.tsx`) which dynamic-
 * imports it inside `useLayoutEffect`, keeping gsap out of the SSR bundle.
 */

let pluginRegistered = false;

async function loadGsap() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  if (!pluginRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    pluginRegistered = true;
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Initialise hero entrance + scroll reveals. Resolves to a cleanup function
 * that reverts all animation state (tweens, triggers, inline styles).
 */
export async function initPageAnimations(): Promise<() => void> {
  if (typeof window === "undefined") return () => undefined;
  if (prefersReducedMotion()) return () => undefined;

  const { gsap, ScrollTrigger } = await loadGsap();

  // Re-check after the async load in case the preference changed mid-flight.
  if (prefersReducedMotion()) return () => undefined;

  const ctx = gsap.context(() => {
    // Hero entrance — plays once on load for items inside [data-hero].
    // Subtle-only: small y12 drift + fade, 0.5s, soft stagger.
    const heroItems =
      gsap.utils.toArray<HTMLElement>("[data-hero] [data-reveal]");
    if (heroItems.length > 0) {
      gsap.from(heroItems, {
        y: 12,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.07,
        overwrite: "auto",
        clearProps: "transform,opacity",
      });
    }

    // Bento / section reveals — batched ScrollTriggers, once each.
    // Subtle-only: y16 + fade over 0.6s.
    // Hero descendants are excluded (already handled by the entrance above).
    const scrollItems = gsap.utils
      .toArray<HTMLElement>("[data-reveal]")
      .filter(
        (el) =>
          !el.closest("[data-hero]") &&
          !el.closest(".projects-carousel") &&
          !el.closest(".showcase"),
      );
    if (scrollItems.length > 0) {
      gsap.set(scrollItems, { y: 16, opacity: 0 });
      ScrollTrigger.batch(scrollItems, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            overwrite: "auto",
            clearProps: "transform,opacity",
          }),
      });
      ScrollTrigger.refresh();
    }
  });

  return () => {
    ctx.revert();
    ScrollTrigger.refresh();
  };
}