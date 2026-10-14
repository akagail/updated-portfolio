import Image from "next/image";

import type { Profile } from "../lib/types";
import { SectionIndex } from "./tech";

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutProps {
  profile: Profile;
  stats?: AboutStat[];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Editorial profile: oversized lead, open whitespace, one portrait moment. */
export default function About({ profile, stats = [] }: AboutProps) {
  const { name, title, bio, education_summary, location, avatar, resume } =
    profile;

  const paragraphs = bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [lead, ...rest] = paragraphs.length
    ? paragraphs
    : [
        name
          ? `${name} builds practical software for real-world problems.`
          : "Practical software for real-world problems.",
      ];

  return (
    <section
      id="about"
      data-reveal
      aria-labelledby="about-heading"
      className="editorial-block"
    >
      <SectionIndex num="01" name="About" side="Hello" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
        <div className="min-w-0">
          <h2 id="about-heading" className="about-lead max-w-[26ch] text-balance">
            {lead}
          </h2>
          {rest.slice(0, 3).map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className="mt-5 max-w-[62ch] break-words text-[1rem] leading-relaxed text-[var(--ink-soft)]"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {resume ? (
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Resume
              </a>
            ) : null}
            <a
              href="#contact"
              className="inline-flex min-h-[44px] items-center font-display text-[0.95rem] font-bold text-[var(--accent)]"
            >
              Say hello <span aria-hidden="true" className="ml-1">→</span>
            </a>
          </div>

          {stats.length > 0 ? (
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <dd className="m-0 font-display text-[clamp(2rem,3.4vw,2.8rem)] font-extrabold leading-none tracking-tight text-[var(--ink)]">
                    {stat.value}
                  </dd>
                  <dt className="tech-label mt-2">{stat.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <aside className="min-w-0" aria-label="At a glance">
          <div className="about-portrait">
            {avatar ? (
              <span className="relative block aspect-[4/5] overflow-hidden">
                <Image
                  src={avatar}
                  alt={`Portrait of ${name}`}
                  fill
                  sizes="(max-width: 1023px) 100vw, 360px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="grid aspect-[4/5] place-items-center font-display text-[clamp(3rem,8vw,5rem)] font-extrabold text-white/90"
                style={{
                  background:
                    "linear-gradient(150deg, #8fd8ff, #43cfc5 55%, #c7f5d9)",
                }}
              >
                {getInitials(name) || "○"}
              </span>
            )}
          </div>
          <dl className="mt-5 space-y-2 text-[0.9rem]">
            {title ? (
              <div className="flex gap-3">
                <dt className="tech-label w-20 shrink-0 pt-1">Role</dt>
                <dd className="m-0 text-[var(--ink)]">{title}</dd>
              </div>
            ) : null}
            {location ? (
              <div className="flex gap-3">
                <dt className="tech-label w-20 shrink-0 pt-1">Based</dt>
                <dd className="m-0 text-[var(--ink-soft)]">{location}</dd>
              </div>
            ) : null}
            {education_summary ? (
              <div className="flex gap-3">
                <dt className="tech-label w-20 shrink-0 pt-1">Studied</dt>
                <dd className="m-0 text-[var(--ink-soft)]">{education_summary}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
    </section>
  );
}
