export type PageSlug = "home" | "create" | "projects";

export type SiteProfile = {
  name: string;
  location: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  heroSummary: string;
  heroDetail: string;
  degree: string;
  graduation: string;
  gpa: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  dateRange: string;
  location: string;
  bullets: string[];
  kind: "leadership" | "internship" | "research";
};

export type ProjectItem = {
  name: string;
  stack: string[];
  dateRange: string;
  bullets: string[];
};

export type CertificationItem = {
  name: string;
  date: string;
};

export type EducationSnapshot = {
  school: string;
  timezone: string;
  cityLabel: string;
  weather: {
    temperatureF: number;
    condition: string;
    fetchedAt: string;
  };
  aqi: {
    value: number;
    category: string;
    fetchedAt: string;
  };
  localTimeIso: string;
};

export type GitHubActivityDay = {
  date: string;
  count: number;
};

export type GitHubRepoSummary = {
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type GitHubSnapshot = {
  username: string;
  days: GitHubActivityDay[];
  recentContributions: number;
  yearContributions: number;
  lastRepo: GitHubRepoSummary | null;
  featuredRepo: GitHubRepoSummary | null;
  fetchedAt: string;
};

export type SemesterCourseNode = {
  id: string;
  label: string;
  semester: string;
  year: number;
  level: number;
  track: number;
  dependsOn: string[];
};

export type SkillBubble = {
  id: string;
  label: string;
  size: number;
  baseSize: number;
  weight: number;
  hue: number;
};

export type SkillState = {
  bubbles: SkillBubble[];
  updatedAt: string;
};

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
};

export type WordleGameConfig = {
  type: "wordle";
  id: string;
  answer: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
};

export type ConnectionsGroup = {
  category: string;
  color: "amber" | "green" | "blue" | "purple";
  words: string[];
};

export type ConnectionsGameConfig = {
  type: "connections";
  id: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  groups: ConnectionsGroup[];
};

export type GameConfig = WordleGameConfig | ConnectionsGameConfig;

export type GameSummary = {
  id: string;
  type: GameConfig["type"];
  createdAt: string;
  expiresAt: string;
  path: string;
};

export type GameCreateResult = {
  game: GameSummary;
};

export type SkillGrowthPayload = {
  id: string;
};

export type BootstrapPayload = {
  education: EducationSnapshot;
  github: GitHubSnapshot;
  currentTrack: MusicTrack;
  coursework: SemesterCourseNode[];
  skills: SkillState;
};
