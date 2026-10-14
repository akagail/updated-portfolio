"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface NavbarLink {
  href: string;
  label: string;
}

export interface NavbarProps {
  brand: string;
  links?: NavbarLink[];
  status?: string;
  className?: string;
}

const DEFAULT_LINKS: NavbarLink[] = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({
  brand,
  links = DEFAULT_LINKS,
  status,
  className = "",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) panelRef.current?.querySelector("a")?.focus();
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) close();
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open, close]);

  // Active-section probe — pin spacer keeps #work stable, underline holds.
  useEffect(() => {
    const ids = links.map((link) => link.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const probe = y + window.innerHeight * 0.4;
        let current = "";
        for (const section of sections) {
          // rect-based: GSAP's pin-spacer is position:relative, which collapses
          // #work's offsetTop — rects stay in document space regardless.
          if (section.getBoundingClientRect().top + y <= probe) current = `#${section.id}`;
        }
        setActive(current);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [links]);

  return (
    <div className={`nav-shell ${className}`}>
      <nav aria-label="Primary" className="nav-pill">
        <a href="#top" aria-label={`${brand} — back to top`} className="nav-brand">
          <span aria-hidden="true" style={{ color: "var(--accent)" }}>
            ●{" "}
          </span>
          <span className="hidden sm:inline">{brand}</span>
          <span className="sm:hidden">{brand.split(/\s+/)[0]}</span>
        </a>
        {status ? (
          <p
            aria-hidden="true"
            className="mr-1 hidden items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--muted)] xl:inline-flex"
          >
            <span className="status-dot" />
            {status}
          </p>
        ) : null}

        <ul aria-label="Sections" className="hidden list-none items-center p-0 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                className={`nav-link${active === link.href ? " nav-link--active" : ""}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          ref={toggleRef}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="nav-link md:hidden"
          style={{ minWidth: "44px", minHeight: "40px", justifyContent: "center" }}
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open ? (
        <div
          className="glass pointer-events-auto absolute mt-2 w-[min(92vw,22rem)] rounded-[var(--radius-lg)] p-2 md:hidden"
          style={{ borderRadius: "var(--radius-lg)", top: "100%", left: "50%", transform: "translateX(-50%)" }}
        >
          <ul
            id={menuId}
            ref={panelRef}
            aria-label="Mobile sections"
            className="flex list-none flex-col p-0"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="flex min-h-[44px] items-center rounded-[var(--radius-sm)] px-4 font-display text-[0.95rem] font-semibold text-[var(--ink)] no-underline hover:bg-white/70"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="p-2">
              <a href="#contact" onClick={close} className="btn btn-accent w-full">
                Get in touch
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
