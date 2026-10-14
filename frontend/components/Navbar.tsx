"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

export interface NavbarLink {
  href: string;
  label: string;
}

export interface NavbarProps {
  /** Brand text shown in the top-left (e.g. site owner name). Passed in — never hardcoded. */
  brand: string;
  /** Anchor links. Defaults to the five portfolio sections + contact. */
  links?: NavbarLink[];
  className?: string;
}

const DEFAULT_LINKS: NavbarLink[] = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
];

export default function Navbar({
  brand,
  links = DEFAULT_LINKS,
  className = "",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
  }, [prefersReducedMotion]);

  // Move focus into the menu on open; Escape closes and returns focus.
  useEffect(() => {
    if (open) panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  // Close the mobile menu on Escape and when resizing up to desktop.
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

  // Subtle sticky behaviour — add a soft border + backdrop once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track the active section for the nav underline.
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
        const probe = window.scrollY + window.innerHeight * 0.4;
        let current = "";
        for (const section of sections) {
          if (section.offsetTop <= probe) current = `#${section.id}`;
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
    <header
      id="top"
      className={[
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] shadow-[var(--shadow-sm)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="container-x">
        <nav
          aria-label="Primary"
          className="flex items-center justify-between gap-4"
          style={{ minHeight: "72px" }}
        >
          <a
            href="#top"
            aria-label={`${brand} — back to top`}
            title={brand}
            className="min-w-0 overflow-hidden whitespace-nowrap text-[1.0625rem] font-bold tracking-[-0.01em] text-[var(--ink)] no-underline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: "44px",
            }}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
            {brand}
          </a>

          {/* Desktop links */}
          <ul
            aria-label="Sections"
            className="hidden list-none items-center gap-1 p-0 md:flex"
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`nav-link ${
                    active === link.href ? "nav-link--active" : ""
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="ml-3">
              <a href="#contact" className="btn btn-dark">
                Contact
              </a>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            type="button"
            ref={toggleRef}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:border-[var(--border-strong)] md:hidden"
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" />
              ) : (
                <path d="M3 5.5h14M3 10h14M3 14.5h14" />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile menu panel */}
      {open ? (
        <div
          className="container-x border-t border-[var(--border)] bg-[var(--bg)] md:hidden"
          style={{ paddingBottom: "0.75rem" }}
        >
          <ul
            id={menuId}
            ref={panelRef}
            aria-label="Mobile sections"
            className="flex list-none flex-col p-0"
            style={{ paddingTop: "0.25rem" }}
          >
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="flex min-h-[44px] items-center text-[0.975rem] text-[var(--ink-soft)] no-underline transition-colors hover:text-[var(--ink)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#contact"
                onClick={close}
                className="btn btn-dark w-full"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}