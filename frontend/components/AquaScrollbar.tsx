"use client";

import { useEffect, useRef } from "react";

type LenisLike = { scrollTo: (value: number, options?: Record<string, unknown>) => void };

function getLenis(): LenisLike | null {
  const w = window as unknown as { __lenis?: LenisLike };
  return w.__lenis ?? null;
}

/**
 * Liquid water scrollbar: fixed left-edge droplet stream + travelling thumb.
 * Decorative duplicate of native scrolling (aria-hidden); keyboard users keep
 * native scroll. Reads window.scrollY (Lenis drives window scrolling, native
 * events still fire), paints via translateY only, drags via Lenis when present.
 */
export default function AquaScrollbar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    const drop = dropRef.current;
    if (!root || !track || !thumb || !drop) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let max = 0;
    let raf = 0;
    let dragging = false;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let relaxTimer = 0;

    const paint = () => {
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const travel = Math.max(0, track.clientHeight - thumb.offsetHeight);
      thumb.style.transform = `translateY(${(p * travel).toFixed(1)}px)`;
    };

    const measure = () => {
      max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      root.style.display = max > 0 ? "" : "none";
      lastY = window.scrollY;
      paint();
    };

    const scrollToTarget = (target: number, instant: boolean) => {
      const clamped = Math.min(max, Math.max(0, target));
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(Math.round(clamped), instant ? { immediate: true } : {});
      } else {
        window.scrollTo({ top: Math.round(clamped), behavior: instant ? "auto" : "smooth" });
      }
    };

    const ratioFromClientY = (clientY: number) => {
      const r = track.getBoundingClientRect();
      const travel = Math.max(1, r.height - thumb.offsetHeight);
      return Math.min(1, Math.max(0, (clientY - r.top - thumb.offsetHeight / 2) / travel));
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          paint();
        });
      }
      // Liquid stretch while moving, relaxing at rest. Position untouched.
      if (!reduced && !dragging) {
        const now = performance.now();
        const y = window.scrollY;
        const v = Math.abs(y - lastY) / Math.max(1, now - lastT);
        lastY = y;
        lastT = now;
        drop.style.transform = `scaleY(${(1 + Math.min(0.3, v * 0.22)).toFixed(3)})`;
        window.clearTimeout(relaxTimer);
        relaxTimer = window.setTimeout(() => {
          drop.style.transform = "scaleY(1)";
        }, 130);
      }
    };

    const onThumbDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      dragging = true;
      thumb.dataset.dragging = "true";
      try {
        thumb.setPointerCapture?.(e.pointerId);
      } catch {
        /* noop */
      }
      scrollToTarget(ratioFromClientY(e.clientY) * max, true);
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!dragging) return;
      scrollToTarget(ratioFromClientY(e.clientY) * max, true);
    };
    const endThumbDrag = () => {
      if (!dragging) return;
      dragging = false;
      delete thumb.dataset.dragging;
    };
    const onTrackDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      scrollToTarget(ratioFromClientY(e.clientY) * max, false);
    };

    const onResize = () => measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", endThumbDrag);
    thumb.addEventListener("pointercancel", endThumbDrag);
    track.addEventListener("pointerdown", onTrackDown);
    measure();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(relaxTimer);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", endThumbDrag);
      thumb.removeEventListener("pointercancel", endThumbDrag);
      track.removeEventListener("pointerdown", onTrackDown);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="aqua-root">
      <div ref={trackRef} className="aqua-track">
        <div ref={thumbRef} className="aqua-thumb">
          <div ref={dropRef} className="aqua-drop" />
        </div>
      </div>
    </div>
  );
}
