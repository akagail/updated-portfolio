import type { Education as EducationItem } from "../lib/types";

export interface EducationProps {
  items: EducationItem[];
}

export default function Education({ items }: EducationProps) {
  if (items.length === 0) return null;

  return (
    <article
      id="education"
      data-reveal
      aria-labelledby="education-heading"
      className="editorial-block"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow" aria-hidden="true">
          Education
        </p>
        <span className="font-mono text-xs text-[var(--faint)]">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>
      <h2
        id="education-heading"
        className="mt-4 max-w-[14ch] break-words text-balance"
      >
        Formal training.
      </h2>

      <ol className="mt-8 list-none p-0">
        {items.map((item) => (
          <li
            key={item.id}
            data-reveal
            className="border-t border-[var(--border)] py-5"
          >
            <h3 className="break-words text-[1rem] font-semibold text-[var(--ink)]">
              {item.school}
            </h3>
            <p className="mt-1 text-sm font-medium text-[var(--ink-soft)]">
              {item.degree}
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--faint)]">
              <time dateTime={String(item.start_year)}>{item.start_year}</time>
              {" — "}
              {item.end_year !== null ? (
                <time dateTime={String(item.end_year)}>{item.end_year}</time>
              ) : (
                <span>Present</span>
              )}
            </p>
            {item.description ? (
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}