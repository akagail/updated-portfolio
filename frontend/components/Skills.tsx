import type { GroupedSkillCategory, Project } from "../lib/types";

export interface SkillsProps {
  categories: GroupedSkillCategory[];
  /** Used only to suggest an honest fallback group when the CMS is thin. */
  projects?: Project[];
}

/**
 * Skills as grouped editorial columns with hairline dividers — no cards.
 * When the CMS holds almost nothing, a clearly-marked fallback group is
 * derived from technologies actually used in projects (never invented).
 */
export default function Skills({ categories, projects = [] }: SkillsProps) {
  if (categories.length === 0) return null;

  const known = new Set(
    categories.flatMap((c) => c.skills.map((s) => s.name.toLowerCase())),
  );
  const derived = Array.from(
    new Set(
      projects
        .flatMap((p) => p.techs)
        .map((t) => t.trim())
        .filter((t) => t && !known.has(t.toLowerCase())),
    ),
  ).slice(0, 12);

  const groups = derived.length
    ? [
        ...categories,
        {
          id: -1,
          name: "Also in my projects",
          order: 999,
          skills: derived.map((name, i) => ({
            id: -1000 - i,
            category: -1,
            category_name: "Also in my projects",
            name,
            level: "",
            icon: "",
            order: i,
          })),
        },
      ]
    : categories;

  return (
    <section
      id="skills"
      data-reveal
      aria-labelledby="skills-heading"
      className="editorial-block"
    >
      <p className="eyebrow" aria-hidden="true">
        Skills
      </p>
      <h2
        id="skills-heading"
        className="mt-4 max-w-[14ch] break-words text-balance"
      >
        Tools I work with daily.
      </h2>
      <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
        A focused, practical stack — chosen for reliability and craft.
      </p>

      <div className="mt-8 grid gap-x-8 gap-y-7 border-t border-[var(--border)] pt-7 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((category) => (
          <div key={category.id} className="min-w-0">
            <h3
              id={`skills-category-${category.id}`}
              className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
            >
              {category.name}
              {category.id === -1 ? (
                <span className="placeholder-note"> (from projects)</span>
              ) : null}
            </h3>
            <ul
              aria-labelledby={`skills-category-${category.id}`}
              className="mt-4 list-none space-y-3 p-0"
            >
              {category.skills.map((skill, idx) => (
                <li
                  key={skill.id}
                  className="flex items-baseline gap-3 text-[0.9375rem] leading-relaxed"
                >
                  {skill.icon ? (
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[var(--muted)]"
                    >
                      {skill.icon}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-xs text-[var(--faint)]"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="text-[var(--ink)]">{skill.name}</span>
                  {skill.level ? (
                    <span className="ml-auto shrink-0 text-xs text-[var(--faint)]">
                      {skill.level}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
