import type { Profile, SocialLink } from "../lib/types";

export interface ContactProps {
  profile: Profile | null;
  socials: SocialLink[];
}

export default function Contact({ profile, socials }: ContactProps) {
  if (!profile && socials.length === 0) return null;

  const email = profile?.email ?? "";
  const name = profile?.name ?? "";

  return (
    <article
      id="contact"
      data-reveal
      aria-labelledby="contact-heading"
      className="contact-close"
    >
      <div className="min-w-0">
        <p className="eyebrow !text-[color-mix(in_srgb,var(--accent-ink)_70%,transparent)]">
          Contact
        </p>
        <h2
          id="contact-heading"
          className="mt-5 max-w-[18ch] break-words text-balance text-[clamp(1.875rem,4vw,3rem)]"
        >
          Have a project in mind?{" "}
          <span className="underline decoration-[color-mix(in_srgb,var(--accent-ink)_50%,transparent)] underline-offset-4">
            Let us talk.
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
        {email ? (
          <a href={`mailto:${email}`} className="btn btn-contrast">
            {email}
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
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
            </svg>
          </a>
        ) : null}

        {socials.length > 0 ? (
          <ul
            aria-label="Social links"
            className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0"
          >
            {socials.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.platform} profile`}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-sm font-medium text-[color-mix(in_srgb,var(--accent-ink)_85%,transparent)] no-underline transition-colors hover:text-[var(--accent-ink)]"
                >
                  {link.platform}
                  <svg
                    aria-hidden="true"
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.5 10.5l7-7M4.5 3.5h6v6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {name ? (
        <p className="font-mono text-xs text-[color-mix(in_srgb,var(--accent-ink)_60%,transparent)]">
          {name}
        </p>
      ) : null}
    </article>
  );
}