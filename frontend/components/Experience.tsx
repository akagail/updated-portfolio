import type { Experience as ExperienceItem } from "../lib/types";

export interface ExperienceProps {
  items: ExperienceItem[];
}

function formatRange(item: ExperienceItem): string {
  const end = item.is_current ? "Present" : (item.end_date ?? "Present");
  return `${item.start_date} – ${end}`;
}

export default function Experience({ items }: ExperienceProps) {
  if (items.length === 0) return null;

  return (
    <article
      id="experience"
      data-reveal
      aria-labelledby="experience-heading"
      className="editorial-block"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow" aria-hidden="true">
          Experience
        </p>
        <span className="font-mono text-xs text-[var(--faint)]">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>
      <h2
        id="experience-heading"
        className="mt-4 max-w-[18ch] break-words text-balance"
      >
        A record of previous roles.
      </h2>

      <ol className="mt-8 list-none p-0">
        {items.map((item) => (
          <li
            key={item.id}
            data-reveal
            className="relative border-t border-[var(--border)] py-6 transition-colors"
          >
            <article
              aria-labelledby={`experience-position-${item.id}`}
              className="grid min-w-0 gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6"
            >
              {/* Date column */}
              <div className="font-mono text-xs leading-relaxed text-[var(--faint)] sm:pt-1.5">
                <time dateTime={item.start_date}>{item.start_date}</time>
                {" — "}
                {item.is_current ? (
                  <span>Present</span>
                ) : item.end_date ? (
                  <time dateTime={item.end_date}>{item.end_date}</time>
                ) : (
                  <span>Present</span>
                )}
                <span className="sr-only"> ({formatRange(item)})</span>
              </div>

              {/* Content column */}
              <div className="min-w-0">
                <h3
                  id={`experience-position-${item.id}`}
                  className="break-words text-[1.0625rem] font-semibold text-[var(--ink)]"
                >
                  {item.position}
                </h3>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                  {item.company}
                </p>
                {item.is_current ? (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                    <span className="status-dot !h-1.5 !w-1.5" />
                    Current
                  </span>
                ) : null}
                {item.description ? (
                  <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </article>
  );
}