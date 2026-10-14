import type { Profile, SocialLink } from "../lib/types";

interface HeroProps {
  profile: Profile | null;
  socials: SocialLink[];
}

export default function Hero({ profile, socials }: HeroProps) {
  if (!profile) {
    return (
      <header
        data-hero
        aria-label="Introduction"
        className="container-x overflow-x-clip"
        style={{
          paddingTop: "clamp(8rem, 16vh, 11rem)",
          paddingBottom: "clamp(4rem, 9vh, 7rem)",
        }}
      >
        <p role="status" data-reveal className="text-[var(--muted)]">
          Profile is currently unavailable.
        </p>
      </header>
    );
  }

  const { name, title, intro, email, location, resume } = profile;

  return (
    <header
      data-hero
      aria-labelledby="hero-heading"
      className="container-x overflow-x-clip"
      style={{
        paddingTop: "clamp(8rem, 16vh, 11rem)",
        paddingBottom: "clamp(5rem, 10vh, 8rem)",
      }}
    >
      <div className="mx-auto max-w-[64rem]">
        {location ? (
          <p
            data-reveal
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]"
          >
            <span className="status-dot" aria-hidden="true" />
            {location}
          </p>
        ) : null}

        <h1
          data-reveal
          id="hero-heading"
          className="mt-7 min-w-0 max-w-[16ch] break-words"
        >
          {name}
        </h1>

        {title ? (
          <p
            data-reveal
            className="mt-6 max-w-[38rem] text-lg font-medium tracking-[-0.01em] text-[var(--ink-soft)] sm:text-xl"
          >
            {title}
          </p>
        ) : null}

        {intro ? (
          <p data-reveal className="lede mt-6 max-w-[46rem] break-words">
            {intro}
          </p>
        ) : null}

        <div
          data-reveal
          className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3"
        >
          <a href="#work" className="btn btn-dark">
            Explore my work
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2v11M3.5 9 8 13.5 12.5 9" />
            </svg>
          </a>
          {resume ? (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--ink)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
            >
              View résumé
            </a>
          ) : email ? (
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--ink)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:decoration-[var(--accent)]"
            >
              Get in touch
            </a>
          ) : null}
        </div>

        {socials.length > 0 ? (
          <div
            data-reveal
            className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-6 border-t border-[var(--border)] pt-8"
          >
            <ul
              aria-label={`Social links for ${name}`}
              className="flex list-none flex-wrap items-center gap-x-7 gap-y-3 p-0"
            >
              {socials.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${link.platform} profile`}
                    className="group inline-flex min-h-[44px] min-w-[44px] items-center text-sm font-medium text-[var(--ink-soft)] no-underline transition-colors hover:text-[var(--ink)]"
                  >
                    {link.platform}
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
                      className="ml-1.5 translate-y-[-2px] text-[var(--faint)] transition-colors group-hover:text-[var(--muted)]"
                    >
                      <path d="M3.5 10.5l7-7M4.5 3.5h6v6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p
          data-reveal
          aria-hidden="true"
          className="mt-16 font-mono text-xs uppercase tracking-[0.2em] text-[var(--faint)]"
        >
          Scroll to explore
          <span className="scroll-hint" />
        </p>
      </div>
    </header>
  );
}
