"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import type { DeviceScreen } from "../lib/types";
import { createRig, type PhoneRig } from "./FlipPhone/rig";

const PhoneScene = dynamic(() => import("./FlipPhone/PhoneScene"), {
  ssr: false,
  loading: () => <div className="gl-loading" aria-hidden="true" />,
});

/** Catches WebGL init/render failures and swaps in the static fallback. */
class GlErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Static fallback: shell gradient + real screen image (or NO SIGNAL). */
function GlFallback({ screenUrl }: { screenUrl: string | null }) {
  return (
    <div className="gl-fallback" aria-hidden="true">
      <div className="gl-fallback__screen">
        {screenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={screenUrl} alt="" draggable={false} />
        ) : (
          <span>NO SIGNAL</span>
        )}
      </div>
    </div>
  );
}

/**
 * Interactive WebGL clamshell flip phone: drag to rotate (360° horizontal,
 * clamped tilt), inertia on release, double-click / Home to reset.
 * Rendering lives in the dynamically imported scene (phone-only canvas);
 * layout, hero copy, sky, bubbles and carousel stay in DOM/CSS.
 * Screen image comes from Django (`DeviceScreen.screen_image`).
 */
export default function FlipPhone({ device }: { device: DeviceScreen | null }) {
  const rigRef = useRef<PhoneRig | null>(null);
  if (!rigRef.current) rigRef.current = createRig();

  const [wrapEl, setWrapEl] = useState<HTMLDivElement | null>(null);
  const [glOK, setGlOK] = useState(true);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) setGlOK(false);
    } catch {
      setGlOK(false);
    }
  }, []);

  const screenUrl = device?.screen_image ?? null;
  const showGL = glOK && wrapEl;

  return (
    <figure data-reveal className="flip-figure">
      <div
        ref={setWrapEl}
        tabIndex={0}
        aria-label="Interactive 3D flip phone. Drag to rotate, double-click or press Home to reset."
        className="gl-wrap"
      >
        <div className="gl-view">
          <div className="gl-shadow" aria-hidden="true" />
          {showGL ? (
            <GlErrorBoundary fallback={<GlFallback screenUrl={screenUrl} />}>
              <PhoneScene rig={rigRef.current} wrap={wrapEl} screenUrl={screenUrl} />
            </GlErrorBoundary>
          ) : (
            <GlFallback screenUrl={screenUrl} />
          )}
        </div>
      </div>
      <figcaption className="flip-caption">
        <span aria-hidden="true">Drag to spin · double-click to reset</span>
      </figcaption>
    </figure>
  );
}
