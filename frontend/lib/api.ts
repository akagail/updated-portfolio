import type {
  DeviceScreen,
  Education,
  Experience,
  GroupedSkillCategory,
  Profile,
  Project,
  Skill,
  SocialLink,
} from "./types";

export class ApiError extends Error {
  status: number;
  url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const REVALIDATE_SECONDS = 60;

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new ApiError(
      `API request failed: ${res.status} ${res.statusText}`,
      res.status,
      url,
    );
  }
  return (await res.json()) as T;
}

export async function getProfile(): Promise<Profile | null> {
  try {
    return await fetchJson<Profile>("/api/profile/");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function getSocialLinks(): Promise<SocialLink[]> {
  return fetchJson<SocialLink[]>("/api/social-links/");
}

export function getSkills(): Promise<Skill[]> {
  return fetchJson<Skill[]>("/api/skills/");
}

export function getGroupedSkills(): Promise<GroupedSkillCategory[]> {
  return fetchJson<GroupedSkillCategory[]>("/api/skills/grouped/");
}

export function getProjects(featuredOnly = false): Promise<Project[]> {
  return fetchJson<Project[]>(
    featuredOnly ? "/api/projects/?featured=true" : "/api/projects/",
  );
}

export function getExperience(): Promise<Experience[]> {
  return fetchJson<Experience[]>("/api/experience/");
}

export function getEducation(): Promise<Education[]> {
  return fetchJson<Education[]>("/api/education/");
}

export async function getDeviceScreen(): Promise<DeviceScreen | null> {
  try {
    return await fetchJson<DeviceScreen>("/api/device-screen/active/");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
