import type { Experience as ExperienceItem } from "../lib/types";
import { SectionIndex } from "./tech";

export interface ExperienceProps {
  items: ExperienceItem[];
}

function formatMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return iso;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Flowing sequence: water-drop markers, date / role / story hierarchy. */
export default function Experience({ items }: ExperienceProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="experience"
      data-reveal
      aria-labelledby="experience-heading"
      className="editorial-block"
    >
      <SectionIndex
        num="04"
        name="Experience"
        side={`${String(items.length).padStart(2, "0")} roles`}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <div className="min-w-0">
          <h2 id="experience-heading" className="max-w-[14ch] text-balance">
            Where I&apos;ve been.
          </h2>
          <p className="mt-4 max-w-[36ch] text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Real roles, real dates — exactly as listed, newest first.
          </p>
        </div>

        <ol className="min-w-0 list-none p-0">
          {items.map((item) => (
            <li
              key={item.id}
              data-reveal
              className="relative grid gap-1 py-7 pl-10 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-6"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span aria-hidden="true" className="timeline-rail" />
              <span aria-hidden="true" className="timeline-drop" />
              <div className="font-mono text-[0.72rem] uppercase leading-relaxed tracking-[0.1em] text-[var(--muted)] sm:pt-1.5">
                <time dateTime={item.start_date}>{formatMonth(item.start_date)}</time>
                {" — "}
                {item.is_current ? (
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>Now</span>
                ) : item.end_date ? (
                  <time dateTime={item.end_date}>{formatMonth(item.end_date)}</time>
                ) : (
                  <span>Now</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="break-words text-[1.15rem] font-bold tracking-tight text-[var(--ink)]">
                  {item.position}
                </h3>
                <p className="mt-0.5 font-display text-[0.95rem] font-semibold text-[var(--ink-soft)]">
                  {item.company}
                  {item.is_current ? (
                    <span className="glass ml-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 align-middle font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--accent)]">
                      <span className="status-dot" style={{ width: 6, height: 6 }} />
                      Current
                    </span>
                  ) : null}
                </p>
                {item.description ? (
                  <p className="mt-2 max-w-[58ch] text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
