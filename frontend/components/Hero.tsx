"use client";

import { useRef } from "react";

import type { Profile, SocialLink } from "../lib/types";
import CloudScene from "./CloudScene";

interface HeroProps {
  profile: Profile | null;
  socials: SocialLink[];
}

/**
 * Sky-first hero: editorial headline, real CMS copy only,
 * one floating glass detail + pointer-responsive light (CSS vars, no lib).
 */
export default function Hero({ profile, socials }: HeroProps) {
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
      <span aria-hidden="true" className="hero-bubble" style={{ width: 120, height: 120, left: "6%", top: "22%" }} />
      <span aria-hidden="true" className="hero-bubble float-soft" style={{ width: 64, height: 64, left: "12%", top: "58%" }} />
      <span aria-hidden="true" className="hero-bubble" style={{ width: 180, height: 180, right: "4%", top: "12%", opacity: 0.8 }} />
      <span aria-hidden="true" className="hero-bubble float-soft" style={{ width: 44, height: 44, right: "18%", bottom: "18%", animationDelay: "-3s" }} />

      <div className="container-x relative">
        <p data-reveal className="eyebrow">
          {location ? `${location} — ` : ""}Portfolio {new Date().getFullYear()}
        </p>

        <h1 data-reveal id="hero-heading" className="mt-6 max-w-[16ch]">
          {first ? <span className="hero-gloss block">{first}</span> : null}
          <span className="hero-gloss-accent block">{last || name}</span>
        </h1>

        {title ? (
          <p data-reveal className="mt-5 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-semibold text-[var(--ink-soft)]">
            {title}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:items-end">
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

          {/* Single floating glass detail — availability + socials */}
          <div data-reveal className="min-w-0">
            <div className="glass float-soft max-w-sm rounded-[var(--radius-lg)] p-5 lg:ml-auto">
              <p className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                <span className="status-dot" />
                Open for new work
              </p>
              {resume ? (
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center font-display text-[0.95rem] font-bold text-[var(--ink)]"
                >
                  View resume <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              ) : null}
              {socials.length > 0 ? (
                <ul aria-label={`Social links for ${name}`} className="mt-2 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                  {socials.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.platform} profile`}
                        className="inline-flex min-h-[44px] items-center text-[0.85rem] font-semibold text-[var(--ink-soft)] no-underline hover:text-[var(--accent)]"
                      >
                        {link.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <p data-reveal aria-hidden="true" className="tech-label mt-12">
          Scroll — projects drift sideways below
        </p>
      </div>
    </header>
  );
}
