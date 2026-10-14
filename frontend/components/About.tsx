import Image from "next/image";

import type { Profile } from "../lib/types";

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutProps {
  profile: Profile;
  /** Optional numbers derived from real data (project count, years, etc.). */
  stats?: AboutStat[];
}

// Relationship status and similar personal details don't belong on a portfolio.
const PERSONAL_STATUS = /^(single|married|divorced|widowed)\b/i;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Profile bento — a flat 12-column grid:
 *
 *   ┌───────────── bio ─────────────┐ ┌──── portrait ────┐
 *   └───────────────────────────────┘ │                  │
 *   ┌─ location ─┐ ┌── status ──┐      │                  │
 *   └────────────┘ └────────────┘      └──────────────────┘
 *   ┌──────────── education ────────────┐ ┌─ at a glance ─┐
 *   └───────────────────────────────────┘ └───────────────┘
 *
 * Cards that have no data are skipped and neighbours widen to fill the row,
 * so a thin profile never leaves holes in the grid.
 */
export default function About({ profile, stats = [] }: AboutProps) {
  const {
    name,
    title,
    bio,
    education_summary,
    status,
    location,
    avatar,
    resume,
  } = profile;

  const paragraphs = bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [lead, ...rest] = paragraphs.length
    ? paragraphs
    : [
        name
          ? `${name} builds thoughtful digital products.`
          : "Thoughtful digital products, built with care.",
      ];

  const showStatus = Boolean(status) && !PERSONAL_STATUS.test(status.trim());
  const facts = [
    location ? { label: "Location", value: location, dot: false } : null,
    showStatus ? { label: "Status", value: status, dot: true } : null,
  ].filter(
    (f): f is { label: string; value: string; dot: boolean } => f !== null,
  );

  const factSpans =
    facts.length === 2 ? ["about-s4", "about-s3"] : ["about-s7"];
  const hasFacts = facts.length > 0;
  const hasEducation = Boolean(education_summary);
  const hasStats = stats.length > 0;
  const educationSpan = hasStats ? "about-s8" : "about-s12";
  const statsSpan = hasEducation ? "about-s4" : "about-s12";

  return (
    <section
      id="about"
      data-reveal
      aria-labelledby="about-heading"
      className="editorial-block"
    >
      <div className="about-grid">
        {/* Bio */}
        <div className="about-card about-s7 about-wide">
          <h2 id="about-heading" className="max-w-[20ch] text-balance">
            About me
          </h2>
          <p className="lede mt-5 max-w-[56ch] break-words">{lead}</p>
          {rest.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 max-w-[56ch] break-words text-[1rem] leading-relaxed text-[var(--ink-soft)]"
            >
              {paragraph}
            </p>
          ))}
          <div className="about-actions">
            {resume ? (
              <>
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark"
                >
                  Download résumé
                </a>
                <a href="#contact" className="about-link">
                  Contact me
                </a>
              </>
            ) : (
              <a href="#contact" className="btn btn-dark">
                Contact me
              </a>
            )}
          </div>
        </div>

        {/* Portrait */}
        <figure
          className={`about-card about-portrait about-s5 about-wide${
            hasFacts ? " about-rows-2" : ""
          }`}
        >
          <div className="about-portrait__media">
            {avatar ? (
              <Image
                src={avatar}
                alt={`Portrait of ${name}`}
                fill
                sizes="(max-width: 1023px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <span className="about-portrait__initials" aria-hidden="true">
                {getInitials(name) || "?"}
              </span>
            )}
          </div>
          <figcaption className="about-portrait__caption">
            <p className="font-semibold text-[var(--ink)]">{name}</p>
            {title ? (
              <p className="mt-0.5 text-sm text-[var(--muted)]">{title}</p>
            ) : null}
          </figcaption>
        </figure>

        {/* Quick facts */}
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            className={`about-card ${factSpans[i]}${
              facts.length === 1 ? " about-wide" : ""
            }`}
          >
            <h3 className="about-label">{fact.label}</h3>
            <p className="about-value">
              {fact.dot ? (
                <span
                  className="status-dot mr-2.5 align-middle"
                  aria-hidden="true"
                />
              ) : null}
              {fact.value}
            </p>
          </div>
        ))}

        {/* Education */}
        {hasEducation ? (
          <div className={`about-card ${educationSpan} about-wide`}>
            <h3 className="about-label">Education</h3>
            <p className="about-value max-w-[52ch] break-words !font-medium">
              {education_summary}
            </p>
          </div>
        ) : null}

        {/* At a glance — derived from real data, never invented */}
        {hasStats ? (
          <div className={`about-card about-card--tint ${statsSpan} about-wide`}>
            <h3 className="about-label">At a glance</h3>
            <dl className="about-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}