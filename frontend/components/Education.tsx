import type { Education as EducationItem } from "../lib/types";
import { SectionIndex } from "./tech";

export interface EducationProps {
  items: EducationItem[];
  summary?: string;
}

/** Compact register — CMS rows only, summary fallback when empty. */
export default function Education({ items, summary }: EducationProps) {
  if (items.length === 0 && !summary) return null;

  return (
    <section
      id="education"
      data-reveal
      aria-labelledby="education-heading"
      className="editorial-block"
    >
      <SectionIndex num="05" name="Education" side="Background" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <h2 id="education-heading" className="max-w-[12ch] text-balance">
          Background.
        </h2>
        {items.length > 0 ? (
          <dl className="min-w-0" style={{ borderTop: "1px solid var(--border)" }}>
            {items.map((item) => (
              <div
                key={item.id}
                data-reveal
                className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <dt className="sr-only">{item.school}</dt>
                <dd className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[var(--muted)] sm:pt-1">
                  {item.start_year} — {item.end_year ?? "now"}
                </dd>
                <dd className="m-0 min-w-0">
                  <span className="block break-words text-[1rem] font-bold text-[var(--ink)]">
                    {item.degree}
                  </span>
                  <span className="mt-0.5 block text-sm text-[var(--muted)]">
                    {item.school}
                  </span>
                  {item.description ? (
                    <span className="mt-1.5 block max-w-[58ch] text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
                      {item.description}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : summary ? (
          <p className="min-w-0 max-w-[58ch] text-[1rem] leading-relaxed text-[var(--ink-soft)]">
            {summary}
          </p>
        ) : null}
      </div>
    </section>
  );
}
