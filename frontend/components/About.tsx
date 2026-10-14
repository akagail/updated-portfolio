import type { Profile } from "../lib/types";

export interface AboutProps {
  profile: Profile;
}

/**
 * Editorial profile sheet — a single full-width block with hairline
 * label/value rows. Suits short meta facts (status, location, education)
 * far better than boxes, which left large empty voids.
 */
export default function About({ profile }: AboutProps) {
  const { name, bio, education_summary, status, location } = profile;

  // Relationship status and similar personal details don't belong here.
  const showStatus = status && !/^(single|married|divorced|widowed)\b/i.test(status.trim());

  const rows = [
    showStatus ? { label: "Status", value: status } : null,
    location ? { label: "Location", value: location } : null,
    education_summary ? { label: "Education", value: education_summary } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <section id="about" data-reveal aria-labelledby="about-heading" className="editorial-block">
      <p className="eyebrow" aria-hidden="true">
        About
      </p>
      <h2
        id="about-heading"
        className="mt-4 max-w-[20ch] break-words text-balance"
      >
        {bio ? bio.split(". ")[0] + "." : `A little about ${name || "me"}.`}
      </h2>
      <p className="mt-5 max-w-[52ch] break-words text-[1.0625rem] leading-relaxed text-[var(--ink-soft)]">
        {bio || `${name || "I"} build thoughtful digital products.`}
      </p>

      {rows.length > 0 ? (
        <dl className="m-0 mt-8 p-0">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 border-t border-[var(--border)] py-4 last:border-b sm:grid-cols-[12rem_1fr] sm:gap-6"
            >
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                {row.label}
              </dt>
              <dd className="m-0 break-words text-[1rem] font-medium leading-relaxed text-[var(--ink)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
