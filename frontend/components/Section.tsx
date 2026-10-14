import type { ReactNode } from "react";

export interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headingAs?: "h1" | "h2" | "h3";
}

export default function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  headingAs = "h2",
}: SectionProps) {
  const Heading = headingAs;
  // Hide decorative eyebrow from AT when it merely repeats the heading.
  const hideEyebrow =
    eyebrow !== undefined &&
    eyebrow.trim().toLowerCase() === title.trim().toLowerCase();
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-reveal
      className={["min-w-0", className].filter(Boolean).join(" ")}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p
            data-reveal
            aria-hidden={hideEyebrow || undefined}
            className="eyebrow"
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={titleId}
          data-reveal
          className="mt-2 break-words text-balance"
        >
          {title}
        </Heading>
        {description ? (
          <p
            data-reveal
            className="mt-4 max-w-2xl break-words text-sm leading-relaxed text-[var(--muted)]"
          >
            {description}
          </p>
        ) : null}
        <div className="mt-6 min-w-0 sm:mt-8">{children}</div>
      </div>
    </section>
  );
}
