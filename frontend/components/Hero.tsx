"use client";

import { useRef } from "react";

import type { DeviceScreen, Profile, SocialLink } from "../lib/types";
import CloudScene from "./CloudScene";
import FlipPhone from "./FlipPhone";

interface HeroProps {
  profile: Profile | null;
  socials: SocialLink[];
  device: DeviceScreen | null;
}

/**
 * Sky-first hero: editorial headline, real CMS copy only,
 * one floating glass detail + pointer-responsive light (CSS vars, no lib).
 */
export default function Hero({ profile, socials, device }: HeroProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  if (!profile) {
    return (
      <header
        data-hero
        aria-label="Introduction"
        className="container-x"
        style={{ paddingTop: "clamp(8rem, 16vh, 11rem)", paddingBottom: "4rem" }}
      >
        <p role="status" data-reveal className="text-[var(--muted)]">
          Profile unavailable — publish a profile in Django admin.
        </p>
      </header>
    );
  }

  const { name, title, intro, email, location, resume } = profile;
  const words = name.split(/\s+/).filter(Boolean);
  const first = words.slice(0, -1).join(" ");
  const last = words.slice(-1).join(" ");

  return (
    <header
      data-hero
      ref={ref}
      onMouseMove={onMove}
      aria-labelledby="hero-heading"
      className="hero-sky"
      style={{
        paddingTop: "clamp(8.5rem, 17vh, 12rem)",
        paddingBottom: "clamp(4rem, 9vh, 6.5rem)",
      }}
    >
      {/* Photographic sky scene behind everything else */}
      <CloudScene variant="hero" />
      {/* Sunlight follows pointer — CSS vars, decorative only */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(34rem 22rem at var(--px, 72%) var(--py, 18%), rgba(255,255,255,0.85), transparent 65%)",
        }}
      />
      <span aria-hidden="true" className="hero-bubble" style={{ width: 120, height: 120, left: "6%", top: "22%", ["--hx" as string]: "30%" }} />
      <span aria-hidden="true" className="hero-bubble float-soft" style={{ width: 64, height: 64, left: "12%", top: "58%", ["--hx" as string]: "36%" }} />
      <span aria-hidden="true" className="hero-bubble" style={{ width: 180, height: 180, right: "4%", top: "12%", opacity: 0.8, ["--hx" as string]: "28%" }} />
      <span aria-hidden="true" className="hero-bubble float-soft" style={{ width: 44, height: 44, right: "18%", bottom: "18%", animationDelay: "-3s", ["--hx" as string]: "34%" }} />

      <div className="container-x relative">
        <p data-reveal className="eyebrow">
          {location ? `${location} — ` : ""}Portfolio {new Date().getFullYear()}
        </p>

        <div className="hero-main">
          <div className="hero-titlegrid">
          <div className="min-w-0">
            <h1 data-reveal id="hero-heading" className="mt-3 max-w-[16ch]">
              {first ? <span className="hero-gloss block">{first}</span> : null}
              <span className="hero-gloss-accent block">{last || name}</span>
            </h1>
            {title ? (
              <p data-reveal className="mt-5 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-[var(--ink-soft)]">
                {title}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 max-w-[52ch]">
          <div className="min-w-0">
            {intro ? (
              <p data-reveal className="lede max-w-[48ch]">
                {intro}
              </p>
            ) : null}
            <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#work" className="btn btn-accent">
                Explore the work
                <span aria-hidden="true">→</span>
              </a>
              {email ? (
                <a href={`mailto:${email}`} className="btn btn-outline">
                  Get in touch
                </a>
              ) : resume ? (
                <a href={resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  Resume
                </a>
              ) : null}
            </div>
          </div>
        </div>
          <FlipPhone device={device} />
        </div>

      </div>
    </header>
  );
}
