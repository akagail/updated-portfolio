import type { GroupedSkillCategory, Project } from "../lib/types";
import { SectionIndex } from "./tech";

export interface SkillsProps {
  categories: GroupedSkillCategory[];
  projects?: Project[];
}

/** Floating cluster: one coherent direction, CMS names only, no meters. */
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

  return (
    <section
      id="skills"
      data-reveal
      aria-labelledby="skills-heading"
      className="editorial-block"
    >
      <SectionIndex
        num="02"
        name="Skills"
        side={`${String(categories.length).padStart(2, "0")} areas`}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <div className="min-w-0">
          <h2 id="skills-heading" className="max-w-[12ch] text-balance">
            What I work with.
          </h2>
          <p className="mt-4 max-w-[36ch] text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Only things already on this page — in the CMS or in shipped
            project code. No scores, no meters.
          </p>
        </div>

        <div className="min-w-0 space-y-7">
          {categories.map((category) => (
            <div key={category.id}>
              <h3
                id={`skills-category-${category.id}`}
                className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]"
              >
                {category.name}
              </h3>
              <ul
                aria-labelledby={`skills-category-${category.id}`}
                className="mt-3 flex list-none flex-wrap gap-2 p-0"
              >
                {category.skills.map((skill) => (
                  <li key={skill.id} className="skill-bubble">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {derived.length > 0 ? (
            <div>
              <h3 className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Also in projects
              </h3>
              <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                {derived.map((name) => (
                  <li key={name} className="skill-bubble" style={{ opacity: 0.85 }}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
