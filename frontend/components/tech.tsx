/** Shared editorial primitives: quiet section labels, no terminal chrome. */

export interface SectionIndexProps {
  num: string;
  name: string;
  side?: string;
}

export function SectionIndex({ num, name, side }: SectionIndexProps) {
  return (
    <p className="sys-index">
      <span className="sys-index__num">{num}</span>
      <span>{name}</span>
      <span className="sys-index__rule" aria-hidden="true" />
      {side ? <span className="sys-index__side">{side}</span> : null}
    </p>
  );
}

export interface AsciiGraphicProps {
  name?: string;
  signal?: boolean;
  label?: string;
}

/** Retained for API compatibility — renders only the caption, never ASCII art. */
export function AsciiGraphic({ label }: AsciiGraphicProps) {
  if (!label) return null;
  return (
    <p className="tech-label" aria-hidden="true">
      {label}
    </p>
  );
}

export function DottedLeader() {
  return (
    <span
      aria-hidden="true"
      className="mx-2 flex-1 overflow-hidden text-[var(--border-strong)]"
    >
      {"· ".repeat(32)}
    </span>
  );
}
