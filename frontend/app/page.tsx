import { Suspense } from "react";

import About from "../components/About";
import Contact from "../components/Contact";
import Education from "../components/Education";
import Experience from "../components/Experience";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Reveal from "../components/Reveal";
import Showcase from "../components/Showcase";
import Skills from "../components/Skills";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import {
  getDeviceScreen,
  getEducation,
  getExperience,
  getGroupedSkills,
  getProfile,
  getProjects,
  getSocialLinks,
} from "../lib/api";
import type {
  DeviceScreen,
  Education as EducationItem,
  Experience as ExperienceItem,
  GroupedSkillCategory,
  Profile,
  Project,
  SocialLink,
} from "../lib/types";

export const revalidate = 60;

interface Settled<T> {
  data: T | null;
  error: string | null;
}

async function settle<T>(fn: () => Promise<T>): Promise<Settled<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load this section.";
    return { data: null, error: message };
  }
}

export default async function HomePage() {
  const [
    profileResult,
    socialsResult,
    skillsResult,
    projectsResult,
    experienceResult,
    educationResult,
    deviceResult,
  ] = await Promise.all([
    settle<Profile | null>(() => getProfile()),
    settle<SocialLink[]>(() => getSocialLinks()),
    settle<GroupedSkillCategory[]>(() => getGroupedSkills()),
    settle<Project[]>(() => getProjects()),
    settle<ExperienceItem[]>(() => getExperience()),
    settle<EducationItem[]>(() => getEducation()),
    settle<DeviceScreen | null>(() => getDeviceScreen()),
  ]);

  const profile = profileResult.data;
  const profileError = profileResult.error;
  const socials = socialsResult.data ?? [];
  const socialsError = socialsResult.error;
  const skills = skillsResult.data ?? [];
  const skillsError = skillsResult.error;
  const projects = projectsResult.data ?? [];
  const projectsError = projectsResult.error;
  const experience = experienceResult.data ?? [];
  const experienceError = experienceResult.error;
  const education = educationResult.data ?? [];
  const educationError = educationResult.error;

  const brand = profile?.name ?? "Portfolio";
  const year = new Date().getFullYear();

  const earliestStart = experience.map((e) => e.start_date).sort()[0];
  void earliestStart;
  // Coding since the last year of high school (2019) — stated by the owner.
  const yearsOfExperience = Math.max(1, year - 2019);
  const skillCount = skills.flatMap((c) => c.skills).length;
  const aboutStats = [
    projects.length > 0 && {
      label: "Projects",
      value: String(projects.length),
    },
    yearsOfExperience > 0 && {
      label: "Years",
      value: String(yearsOfExperience),
    },
    skillCount > 0 && { label: "Tech", value: String(skillCount) },
  ].filter((s): s is { label: string; value: string } => Boolean(s));

  const rawStatus = profile?.status ?? "";
  const status = /^(single|married|divorced|widowed)\b/i.test(rawStatus.trim())
    ? undefined
    : rawStatus || undefined;

  return (
    <>
      <Navbar brand={brand} status={status} />
      <main id="main-content">
        <Reveal />

        <Suspense fallback={<LoadingState label="Loading introduction…" />}>
          <Hero profile={profile} socials={socials} device={deviceResult.data} />
        </Suspense>

        {socialsError ? (
          <div className="container-x pb-6" role="presentation">
            <ErrorState message="Social links are currently unavailable." />
          </div>
        ) : null}

        <div className="container-x editorial">
          {profileError || !profile ? (
            <section aria-label="About">
              {profileError ? (
                <ErrorState message="About is currently unavailable." />
              ) : (
                <EmptyState
                  title="Profile unavailable"
                  message="The site owner has not published a profile yet."
                />
              )}
            </section>
          ) : (
            <Suspense fallback={<LoadingState label="Loading about…" />}>
              <About profile={profile} stats={aboutStats} />
            </Suspense>
          )}

          <Suspense fallback={<LoadingState label="Loading skills…" />}>
            {skillsError ? (
              <ErrorState message="Skills are currently unavailable." />
            ) : skills.length === 0 ? (
              <EmptyState
                title="No skills yet"
                message="Skills will appear here once published."
              />
            ) : (
              <Skills categories={skills} projects={projects} />
            )}
          </Suspense>
        </div>

        {/* Pinned scroll-driven horizontal showcase. Owns the #work anchor. */}
        {projectsError ? (
          <div className="container-x editorial">
            <ErrorState message="Projects are currently unavailable." />
          </div>
        ) : projects.length === 0 ? (
          <div className="container-x editorial">
            <EmptyState
              title="No projects yet"
              message="Projects will appear here once published."
            />
          </div>
        ) : (
          <Suspense fallback={<LoadingState label="Loading projects…" />}>
            <Showcase projects={projects} />
          </Suspense>
        )}

        <div className="container-x editorial">
          <Suspense fallback={<LoadingState label="Loading experience…" />}>
            {experienceError ? (
              <ErrorState message="Experience is currently unavailable." />
            ) : experience.length === 0 ? (
              <EmptyState
                title="No experience yet"
                message="Experience entries will appear here once published."
              />
            ) : (
              <Experience items={experience} />
            )}
          </Suspense>

          <Suspense fallback={<LoadingState label="Loading education…" />}>
            {educationError ? (
              <ErrorState message="Education is currently unavailable." />
            ) : (
              <Education
                items={education}
                summary={profile?.education_summary}
              />
            )}
          </Suspense>

          <Suspense fallback={<LoadingState label="Loading contact…" />}>
            <Contact profile={profile} socials={socials} />
          </Suspense>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-8 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--muted)]">
          <p>
            &copy; {year} {brand}
          </p>
          <p aria-hidden="true">
            Neo-Frutiger Aero inspired
          </p>
        </div>
      </footer>
    </>
  );
}
