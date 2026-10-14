import type { ElementType, HTMLAttributes, ReactNode } from "react";

/* Span helpers defined in app/globals.css (lg breakpoint, 12-col grid).
   Minimalist direction (Phase 3.1): flat hairline only — no shadow, no lift.
   Hover only shifts border-color (see .bento-card in globals.css). */
const SPAN_CLASSES: Record<string, string> = {
  "3": "bento-span-3",
  "4": "bento-span-4",
  "5": "bento-span-5",
  "6": "bento-span-6",
  "7": "bento-span-7",
  "8": "bento-span-8",
  "12": "bento-span-12",
};

export type BentoCardProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  /** Column span on lg (12-col grid). Maps to bento-span-* helpers. */
  span?: string;
  className?: string;
  children: ReactNode;
  /** Semantic wrapper — defaults to `article`. */
  as?: ElementType;
  /** When true, adds `data-reveal` for scroll-reveal hooks. */
  reveal?: boolean;
};

export default function BentoCard({
  span,
  className,
  children,
  as: Tag = "article",
  reveal = false,
  ...rest
}: BentoCardProps) {
  const spanClass = span ? SPAN_CLASSES[span] : undefined;
  const classes = ["bento-card", spanClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes}
      {...(reveal ? { "data-reveal": "" } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
