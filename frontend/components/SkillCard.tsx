import type { Skill } from "../lib/types";

export interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <li className="flex min-w-0 items-center gap-2.5 border-b border-[var(--border)] py-2 transition-colors duration-200 hover:border-[var(--border-strong)]">
      {skill.icon ? (
        <span
          aria-hidden="true"
          className="text-sm leading-none text-[var(--muted)]"
        >
          {skill.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink)]">
        {skill.name}
      </span>
      {skill.level ? (
        <span className="shrink-0 text-xs text-[var(--muted)]">
          {skill.level}
        </span>
      ) : null}
    </li>
  );
}
