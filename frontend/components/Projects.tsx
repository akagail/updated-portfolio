import type { Project } from "../lib/types";
import ProjectCard from "./ProjectCard";

export interface ProjectsArchiveProps {
  projects: Project[];
  /**
   * Optional anchor id. Only used when this archive is rendered standalone;
   * the main showcase owns the `#work` anchor.
   */
  id?: string;
}

/**
 * Compact, text-first archive of non-featured projects. Featured projects
 * live in the scroll-driven 3D carousel instead.
 */
export default function ProjectsArchive({
  projects,
  id,
}: ProjectsArchiveProps) {
  if (projects.length === 0) return null;

  return (
    <article
      id={id}
      aria-labelledby="archive-heading"
      data-reveal
      className="bento-card bento-span-12"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow" aria-hidden="true">
            More Work
          </p>
          <h2
            id="archive-heading"
            className="mt-3 break-words text-[1.25rem] font-semibold tracking-[-0.02em] text-[var(--ink)]"
          >
            Experiments &amp; smaller builds
          </h2>
        </div>
        <span className="shrink-0 font-mono text-xs text-[var(--faint)]">
          {String(projects.length).padStart(2, "0")}
        </span>
      </div>
      <ul className="mt-6 grid list-none gap-6 p-0 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} compact />
        ))}
      </ul>
    </article>
  );
}