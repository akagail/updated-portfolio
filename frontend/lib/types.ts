export interface Profile {
  id: number;
  name: string;
  title: string;
  intro: string;
  email: string;
  location: string;
  status: string;
  bio: string;
  education_summary: string;
  avatar: string | null;
  resume: string | null;
}

export interface SocialLink {
  id: number;
  profile: number | null;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export interface SkillCategory {
  id: number;
  name: string;
  order: number;
}

export interface Skill {
  id: number;
  category: number;
  category_name: string;
  name: string;
  level: string;
  icon: string;
  order: number;
}

export interface GroupedSkillCategory extends SkillCategory {
  skills: Skill[];
}

export interface Project {
  id: number;
  title: string;
  short_desc: string;
  detailed_desc: string;
  techs: string[];
  image: string | null;
  github_url: string;
  live_url: string;
  featured: boolean;
  order: number;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  order: number;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  description: string;
  start_year: number;
  end_year: number | null;
  order: number;
}

export interface DeviceScreen {
  id: number;
  title: string;
  screen_image: string | null;
  is_active: boolean;
  updated_at: string;
}
