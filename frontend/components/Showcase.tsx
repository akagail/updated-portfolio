"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Project } from "../lib/types";
import { SectionIndex } from "./tech";

export interface ShowcaseProps {
  projects: Project[];
}

/** Honest placeholder: generic aqua instrument, never fake data. */
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
 * Pinned horizontal showcase — pin + scrub logic preserved.
 * Desktop + motion allowed: section pins, vertical scroll scrubs one `x`
 * tween measured from real track width. Mobile / reduced-motion / no-JS:
 * same markup falls back to a calm vertical stack.
 * Visuals only were reworked (sky stage, glass media, focal depth).
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

        const panels = Array.from(
          track.querySelectorAll<HTMLElement>(".showcase-panel"),
        );
        const setActive = (active: number) => {
          panels.forEach((p, i) =>
            p.setAttribute("data-active", i === active ? "true" : "false"),
          );
        };
        setActive(0);

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
            const active =
              Math.min(
                projects.length,
                Math.floor(self.progress * projects.length) + 1,
              ) || 1;
            if (countRef.current) {
              countRef.current.textContent = String(active).padStart(2, "0");
            }
            setActive(active - 1);
          },
        });

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad);
        // Recalc once fonts settle — prevents mis-measured travel distance.
        let fontsDone = false;
        document.fonts?.ready.then(() => {
          if (!fontsDone) {
            fontsDone = true;
            ScrollTrigger.refresh();
          }
        }).catch(() => undefined);
        refreshRef.current = () => ScrollTrigger.refresh();

        cleanup = () => {
          window.removeEventListener("load", onLoad);
          refreshRef.current = null;
          st.kill();
          tween.kill();
          gsap.set(track, { clearProps: "x" });
          section.removeAttribute("data-showcase-ready");
          panels.forEach((p) => p.removeAttribute("data-active"));
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
      aria-labelledby="work-heading"
      data-reveal
      className="showcase"
    >
      <div className="showcase-stage">
        <div className="showcase-pin">
          <div className="container-x">
            <SectionIndex
              num="03"
              name="Selected work"
              side={`${String(projects.length).padStart(2, "0")} projects`}
            />
          </div>
          <div className="container-x showcase-head mt-6">
            <div className="min-w-0">
              <h2 id="work-heading" className="max-w-[16ch] text-balance">
                Things I&apos;ve built &amp; shipped.
              </h2>
              <p className="mt-3 max-w-[52ch] text-[0.95rem] text-[var(--muted)]">
                Keep scrolling — the projects drift sideways. Each one links
                to the live site and the source.
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
              const id = `PRJ-${String(index + 1).padStart(3, "0")}`;
              return (
                <article
                  key={project.id}
                  aria-label={`Project ${index + 1}: ${project.title}`}
                  data-active={index === 0 ? "true" : "false"}
                  className={`showcase-panel${index % 2 === 1 ? " showcase-panel--flip" : ""}`}
                >
                  <div className="showcase-panel__inner container-x">
                    <div className="showcase-panel__copy">
                      <p className="showcase-meta">
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span aria-hidden="true">{" / "}</span>
                        <span>
                          {String(projects.length).padStart(2, "0")}
                        </span>
                        {project.featured ? (
                          <>
                            <span aria-hidden="true">{" · "}</span>
                            <span>Featured</span>
                          </>
                        ) : null}
                      </p>
                      <h3 className="showcase-title">{project.title}</h3>
                      {description ? (
                        <p className="showcase-desc">{description}</p>
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
                          className="mt-5 flex list-none flex-wrap gap-2 p-0"
                        >
                          {project.techs.map((tech) => (
                            <li key={tech} className="tag">
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
                              className="btn btn-accent"
                            >
                              View live
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                          {project.github_url ? (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="showcase-link"
                            >
                              Source <span aria-hidden="true">→</span>
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <figure className="min-w-0">
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
                      <figcaption className="showcase-figcap" aria-hidden="true">
                        <span>
                          {String(index + 1).padStart(2, "0")} — {id}
                        </span>
                        <span>{project.image ? "From CMS" : "Preview soon"}</span>
                      </figcaption>
                    </figure>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
