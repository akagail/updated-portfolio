"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Project } from "../lib/types";

export interface ShowcaseProps {
  projects: Project[];
}

/** Placeholder visuals stay honest: generic interface mock, never fake data. */
function ProjectMock({ project, index }: { project: Project; index: number }) {
  const rows = [0, 1, 2, 3];
  return (
    <div
      className={`mock mock--${index % 3}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="mock-bar">
        <span className="mock-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="mock-url">
          {project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
        </span>
      </div>
      <div className="mock-grid">
        <div className="mock-side">
          <span className="mock-line mock-line--title" />
          {rows.map((r) => (
            <span
              key={r}
              className="mock-line"
              style={{ width: `${88 - r * 14}%` }}
            />
          ))}
          <span className="mock-chip-row">
            {(project.techs.slice(0, 3).length > 0
              ? project.techs.slice(0, 3)
              : ["web", "app"]
            ).map((t) => (
              <span key={t} className="mock-chip" />
            ))}
          </span>
        </div>
        <div className="mock-main">
          <span className="mock-thumb" />
          <span className="mock-line" style={{ width: "72%" }} />
          <span className="mock-line" style={{ width: "54%" }} />
          <span className="mock-btn-row">
            <span className="mock-btn" />
            <span className="mock-btn mock-btn--ghost" />
          </span>
        </div>
      </div>
      <span className="mock-num">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

/**
 * Scroll-driven horizontal showcase (do-smoothie style).
 *
 * Desktop + motion allowed: the section pins and vertical scroll scrubs a
 * single `x` tween across the track. Travel distance is measured from the
 * real rendered track (`scrollWidth - viewport`), so any project count
 * works and the last panel lands fully in view before release.
 *
 * Mobile / reduced-motion / no-JS: the same markup renders as a calm
 * vertical stack (progressive enhancement — pin only activates from JS).
 */
export default function Showcase({ projects }: ShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (projects.length <= 1) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        if (
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          window.matchMedia("(max-width: 767px)").matches
        ) {
          return;
        }
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        gsap.registerPlugin(ScrollTrigger);
        if (cancelled || !sectionRef.current || !trackRef.current) return;

        const section = sectionRef.current;
        const track = trackRef.current;
        section.setAttribute("data-showcase-ready", "true");

        const travel = () => Math.max(track.scrollWidth - window.innerWidth, 0);

        const tween = gsap.to(track, {
          x: () => -travel(),
          ease: "none",
        });

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${travel()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: tween,
          onUpdate: (self) => {
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${self.progress})`;
            }
            if (countRef.current) {
              const active =
                Math.min(
                  projects.length,
                  Math.floor(self.progress * projects.length) + 1,
                ) || 1;
              countRef.current.textContent = String(active).padStart(2, "0");
            }
          },
        });

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        refreshRef.current = () => ScrollTrigger.refresh();

        cleanup = () => {
          window.removeEventListener("load", onLoad);
          refreshRef.current = null;
          st.kill();
          tween.kill();
          gsap.set(track, { clearProps: "x" });
          section.removeAttribute("data-showcase-ready");
          ScrollTrigger.refresh();
        };
      } catch {
        // Decorative — vertical stack stays in place.
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [projects]);

  if (projects.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Selected work"
      aria-labelledby="work-heading"
      data-reveal
      className="showcase"
    >
      <div className="showcase-pin">
        <div className="container-x showcase-head">
          <div className="min-w-0">
            <p className="eyebrow" aria-hidden="true">
              Selected Work
            </p>
            <h2 id="work-heading" className="mt-4 max-w-[16ch] text-balance">
              Work, one project at a time.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
              Keep scrolling — the work moves sideways.
            </p>
          </div>
          <div className="showcase-progress" aria-hidden="true">
            <span className="showcase-progress__count">
              <span ref={countRef}>01</span>
              {` / ${String(projects.length).padStart(2, "0")}`}
            </span>
            <span className="showcase-progress__track">
              <span ref={barRef} className="showcase-progress__bar" />
            </span>
          </div>
        </div>

        <div ref={trackRef} className="showcase-track">
          {projects.map((project, index) => {
            const description =
              project.short_desc || project.detailed_desc || "";
            const placeholder =
              !project.short_desc && !project.detailed_desc;
            return (
              <article
                key={project.id}
                aria-label={`Project ${index + 1}: ${project.title}`}
                className={`showcase-panel${index % 2 === 1 ? " showcase-panel--flip" : ""}`}
              >
                <div className="showcase-panel__inner container-x">
                  <div className="showcase-panel__copy">
                    <p className="showcase-meta">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span aria-hidden="true"> — </span>
                      <span>{project.featured ? "Featured" : "Project"}</span>
                    </p>
                    <h3 className="showcase-title">{project.title}</h3>
                    {description ? (
                      <p className="showcase-desc">
                        {description}
                        {placeholder ? (
                          <span className="placeholder-note">
                            {" "}
                            (Placeholder — edit in Django admin.)
                          </span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="showcase-desc">
                        <span className="placeholder-note">
                          Description coming soon — editable in Django admin.
                        </span>
                      </p>
                    )}
                    {project.techs.length > 0 ? (
                      <ul
                        aria-label={`Technologies used in ${project.title}`}
                        className="mt-5 flex list-none flex-wrap gap-1.5 p-0"
                      >
                        {project.techs.map((tech) => (
                          <li key={tech} className="tag tag--tint">
                            {tech.trim()}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {project.github_url || project.live_url ? (
                      <div className="showcase-links">
                        {project.live_url ? (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-dark"
                          >
                            Live demo
                          </a>
                        ) : null}
                        {project.github_url ? (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="showcase-link"
                          >
                            Repository
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="showcase-media">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={`${project.title} preview`}
                        fill
                        sizes="100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        onLoad={() => refreshRef.current?.()}
                        className="object-cover"
                      />
                    ) : (
                      <ProjectMock project={project} index={index} />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
