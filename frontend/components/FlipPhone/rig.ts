"use client";

/**
 * Pointer/keyboard/inertia state for the hero flip phone.
 * Framework-free so the WebGL scene (inside the R3F Canvas) and the DOM
 * wrapper share one coherent system — a single rAF driver, no competing loops.
 * Semantics mirror the retired CSS-3D build: 360° horizontal drag, clamped
 * tilt, momentum on release, double-click/Home reset, arrow-key nudge.
 */

export const HOME = { rx: 8, ry: -18 };
export const CLAMP_X = 55;
const SENSITIVITY = 0.45;

export interface PhoneRig {
  tRX: number;
  tRY: number;
  cRX: number;
  cRY: number;
  vX: number;
  vY: number;
  dragging: boolean;
  visible: boolean;
  reduced: boolean;
  lastX: number;
  lastY: number;
  floatT: number;
  /** Re-render trigger, wired by the scene (R3F invalidate). No-op until then. */
  kick: () => void;
}

export function createRig(): PhoneRig {
  return {
    tRX: HOME.rx,
    tRY: HOME.ry,
    cRX: HOME.rx,
    cRY: HOME.ry,
    vX: 0,
    vY: 0,
    dragging: false,
    visible: true,
    reduced: false,
    lastX: 0,
    lastY: 0,
    floatT: 0,
    kick: () => {},
  };
}

/**
 * Advance targets (inertia) and smoothed current rotation.
 * Returns true while motion is unsettled and frames must continue.
 */
export function stepRig(s: PhoneRig, dt: number): boolean {
  if (!s.dragging) {
    s.tRY += s.vY;
    s.tRX = Math.max(-CLAMP_X, Math.min(CLAMP_X, s.tRX + s.vX));
    s.vX *= 0.94;
    s.vY *= 0.94;
  }
  if (s.reduced) {
    s.cRX = s.tRX;
    s.cRY = s.tRY;
  } else {
    // Frame-rate independent smoothing (~0.18 at 60fps, as before).
    const k = 1 - Math.exp(-11 * Math.min(dt, 0.05));
    s.cRX += (s.tRX - s.cRX) * k;
    s.cRY += (s.tRY - s.cRY) * k;
  }
  return (
    Math.abs(s.tRX - s.cRX) > 0.02 ||
    Math.abs(s.tRY - s.cRY) > 0.02 ||
    Math.abs(s.vX) > 0.02 ||
    Math.abs(s.vY) > 0.02
  );
}

export function resetRig(s: PhoneRig) {
  s.tRX = HOME.rx;
  s.tRY = HOME.ry;
  s.vX = 0;
  s.vY = 0;
  s.kick();
}

/**
 * Bind pointer + keyboard + visibility handling to the wrapper element.
 * The scene calls `rig.kick()` (R3F invalidate) whenever a frame is needed.
 */
export function bindRig(wrap: HTMLElement, s: PhoneRig): () => void {
  s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.vX = 0;
    s.vY = 0;
    try {
      wrap.setPointerCapture?.(e.pointerId);
    } catch {
      /* noop: capture unsupported */
    }
    wrap.dataset.grabbing = "true";
    s.kick();
  };
  const onMove = (e: PointerEvent) => {
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.tRY += dx * SENSITIVITY;
    s.tRX = Math.max(-CLAMP_X, Math.min(CLAMP_X, s.tRX - dy * SENSITIVITY));
    s.vY = s.vY * 0.7 + dx * SENSITIVITY * 0.3;
    s.vX = s.vX * 0.7 - dy * SENSITIVITY * 0.3;
    s.kick();
  };
  const endDrag = () => {
    if (!s.dragging) return;
    s.dragging = false;
    delete wrap.dataset.grabbing;
    if (s.reduced) {
      s.vX = 0;
      s.vY = 0;
      s.cRX = s.tRX;
      s.cRY = s.tRY;
    }
    s.kick();
  };
  const reset = () => resetRig(s);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") s.tRY -= 15;
    else if (e.key === "ArrowRight") s.tRY += 15;
    else if (e.key === "ArrowUp") s.tRX = Math.max(-CLAMP_X, s.tRX + 10);
    else if (e.key === "ArrowDown") s.tRX = Math.min(CLAMP_X, s.tRX - 10);
    else if (e.key === "Home") return reset();
    else return;
    e.preventDefault();
    s.kick();
  };
  const onVis = () => {
    if (!document.hidden && s.visible) s.kick();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      s.visible = entry.isIntersecting;
      if (s.visible) s.kick();
    },
    { threshold: 0 },
  );
  io.observe(wrap);

  wrap.addEventListener("pointerdown", onDown);
  wrap.addEventListener("pointermove", onMove);
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);
  wrap.addEventListener("dblclick", reset);
  wrap.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onVis);

  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    wrap.removeEventListener("pointerdown", onDown);
    wrap.removeEventListener("pointermove", onMove);
    wrap.removeEventListener("pointerup", endDrag);
    wrap.removeEventListener("pointercancel", endDrag);
    wrap.removeEventListener("dblclick", reset);
    wrap.removeEventListener("keydown", onKey);
  };
}
