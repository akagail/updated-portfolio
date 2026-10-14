import Image from "next/image";

import type { Project } from "../lib/types";

export interface ProjectCardProps {
  project: Project;
  /** Large, visual-first presentation used for featured projects. */
  featured?: boolean;
  /** Compact text-only presentation used inside the "More experiments" grid. */
  compact?: boolean;
  /** Extra grid span classes when used directly inside the bento grid. */
  className?: string;
}

export default function ProjectCard({
  project,
  featured = false,
  compact = false,
  className = "",
}: ProjectCardProps) {
  const { title, short_desc, detailed_desc, techs, image, github_url, live_url } =
    project;
  const hasLinks = Boolean(github_url) || Boolean(live_url);
  const description = compact
    ? detailed_desc || short_desc
    : short_desc || detailed_desc;

  if (compact) {
    return (
      <li className="group flex min-w-0 flex-col border-t border-[var(--border)] pt-4 transition-colors hover:border-[var(--border-strong)]">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <h3 className="min-w-0 break-words text-lg font-semibold text-[var(--ink)]">
            {title}
          </h3>
          {hasLinks ? (
            <a
              href={live_url || github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} project link`}
              className="mt-1 inline-flex shrink-0 items-center text-sm font-medium text-[var(--ink-soft)] no-underline transition-colors hover:text-[var(--ink)]"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12l8-8M6 4h6v6" />
              </svg>
            </a>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-[var(--muted)]">
          {description}
        </p>
        {techs.length > 0 ? (
          <ul
            aria-label={`Technologies used in ${title}`}
            className="mt-3 flex list-none flex-wrap gap-1.5 p-0"
          >
            {techs.slice(0, 4).map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <article
      data-reveal
      className={[
        "bento-card bento-card--flush group flex min-h-full min-w-0 flex-col overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {image ? (
        <div className="project-image relative aspect-[16/10] w-full border-b border-[var(--border)] bg-[var(--surface-2)]">
          <Image
            src={image}
            alt={`${title} preview`}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 640px"
            loading="lazy"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative aspect-[16/6] w-full border-b border-[var(--border)] bg-[var(--surface-2)]" />
      )}

      <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-7">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <h3 className="min-w-0 break-words text-balance text-[1.375rem] font-semibold">
            {title}
          </h3>
          {featured ? (
            <span className="mt-1 shrink-0 rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
              Featured
            </span>
          ) : null}
        </div>

        <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
          {description}
        </p>

        {techs.length > 0 ? (
          <ul
            aria-label={`Technologies used in ${title}`}
            className="mt-5 flex list-none flex-wrap gap-1.5 p-0"
          >
            {techs.map((tech) => (
              <li key={tech} className="tag tag--tint">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        {hasLinks ? (
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-7">
            {github_url ? (
              <a
                href={github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} source code on GitHub`}
                className="group/link inline-flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm font-semibold text-[var(--ink)] no-underline transition-colors hover:text-[var(--accent)]"
              >
                GitHub
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--faint)] transition-transform duration-200 group-hover/link:translate-x-0.5"
                >
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </a>
            ) : null}
            {live_url ? (
              <a
                href={live_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} live demo`}
                className="group/link inline-flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm font-semibold text-[var(--ink)] no-underline transition-colors hover:text-[var(--accent)]"
              >
                Live demo
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--faint)] transition-transform duration-200 group-hover/link:translate-x-0.5"
                >
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}