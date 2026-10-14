import type { Profile, SocialLink } from "../lib/types";
import { SectionIndex } from "./tech";

export interface ContactProps {
  profile: Profile | null;
  socials: SocialLink[];
}

/** Sunlit pool close: conversational headline, one glass anchor, real links. */
export default function Contact({ profile, socials }: ContactProps) {
  if (!profile && socials.length === 0) return null;

  const email = profile?.email ?? "";
  const name = profile?.name ?? "";

  return (
    <section
      id="contact"
      data-reveal
      aria-labelledby="contact-heading"
      className="editorial-block"
    >
      <SectionIndex num="06" name="Contact" side="Say hello" />

      <div className="contact-pool mt-8">
        <div className="relative" style={{ zIndex: 1 }}>
          <span
            aria-hidden="true"
            className="glass float-soft inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ink-soft)]"
          >
            <span className="status-dot" />
            Replies within a day or two
          </span>
          <h2
            id="contact-heading"
            className="mt-5 max-w-[20ch] break-words text-balance text-[clamp(2.1rem,5vw,3.6rem)]"
          >
            Have something to build?{" "}
            <span className="hero-gloss-accent">Let&apos;s talk.</span>
          </h2>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {email ? (
              <a href={`mailto:${email}`} className="btn btn-accent">
                {email}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
            {socials.length > 0 ? (
              <ul
                aria-label="Social links"
                className="flex list-none flex-wrap gap-2 p-0"
              >
                {socials.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.platform} profile`}
                      className="tag !py-2.5 !px-4 !text-[0.8rem] !no-underline hover:!border-[var(--accent)]"
                    >
                      {link.platform} ↗
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {name ? (
            <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--muted)]">
              {name} — thanks for scrolling this far
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
