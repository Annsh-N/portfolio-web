import type {
  CertificationItem,
  ExperienceItem,
  MusicTrack,
  ProjectItem,
  SemesterCourseNode,
  SiteProfile,
  SkillBubble,
} from "./types";

export const profile: SiteProfile = {
  name: "Annsh Navle",
  location: "West Lafayette, Indiana",
  phone: "765-682-3762",
  email: "anavle@purdue.edu",
  linkedinUrl: "https://linkedin.com/in/annsh-navle",
  githubUrl: "https://github.com/Annsh-N",
  heroSummary:
    "Computer Science and Physics student building backend-heavy products, interactive systems, and polished software experiences.",
  heroDetail:
    "I like infrastructure that feels thoughtful on the inside and expressive on the outside: reliable APIs, clean product surfaces, and technical interfaces that still feel alive.",
  degree: "B.S. in Computer Science + Physics",
  graduation: "May 2027",
  gpa: "3.84 / 4.00",
};

export const experiences: ExperienceItem[] = [
  {
    company: "Purdue Stack",
    role: "Vice President, Projects",
    dateRange: "Feb 2025 - Present",
    location: "West Lafayette, IN",
    kind: "leadership",
    bullets: [
      "Leading end-to-end SDLC for seven Agile teams across planning, sprint execution, reviews, QA, and release cycles.",
      "Standardized delivery with CI/CD expectations, pull request gates, and release checklists to improve reliability and shipping cadence.",
    ],
  },
  {
    company: "Mindcraft Software Ltd.",
    role: "Software Engineer (Full Stack) Intern",
    dateRange: "May 2025 - Jul 2025",
    location: "Mumbai, India",
    kind: "internship",
    bullets: [
      "Built Spring MVC backend functionality for enterprise banking systems, contributing over 26,000 lines of production code.",
      "Created an Angular 16 interface for extracting insights from large document repositories using an internal LLM workflow.",
      "Reduced onboarding time by 30% by shipping a JWT-secured Spring and Angular training portal.",
    ],
  },
  {
    company: "Indepay",
    role: "Backend Developer Intern",
    dateRange: "Jun 2024 - Jul 2024",
    location: "Jakarta, Indonesia",
    kind: "internship",
    bullets: [
      "Built and shipped Node.js REST APIs for mobile integration using JSON-based payloads, contributing to 10% user growth.",
      "Integrated three third-party financial APIs with OAuth2, token refresh, retries, and failure handling.",
      "Improved observability and reliability with validation, structured logging, and TCP/IP debugging.",
    ],
  },
  {
    company: "American Chemical Society (CAS)",
    role: "Research Developer",
    dateRange: "Aug 2023 - May 2024",
    location: "Remote",
    kind: "research",
    bullets: [
      "Developed Random Forest models in scikit-learn to predict chemical reactivity risks with 91% accuracy.",
      "Automated collection pipelines with Selenium and cron-driven scripts to expand the ACS database by 20%.",
      "Built Matplotlib dashboards to visualize accuracy, precision/recall tradeoffs, and model error rates.",
    ],
  },
];

export const projects: ProjectItem[] = [
  {
    name: "CS Alumni Dashboard",
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Purdue SSO", "D3.js"],
    dateRange: "May 2025 - Aug 2025",
    bullets: [
      "Built a full-stack dashboard to analyze 3,000+ Purdue CS alumni by company, role, track, and graduation year.",
      "Engineered secure SSO login, server-side filters, and admin tooling with CSV upload and moderation flows.",
      "Designed salary trend visuals, internship outcome flows, and exportable reporting modules.",
    ],
  },
  {
    name: "PromptGate",
    stack: ["Cloudflare Workers", "TypeScript", "Durable Objects"],
    dateRange: "Jan 2026",
    bullets: [
      "Built a developer tool that compiles prompts with secret redaction and LLM-based semantic compression.",
      "Reduced prompt tokens by 30-50% on noisy inputs while returning cost and latency estimates.",
    ],
  },
  {
    name: "AI PokerBot",
    stack: ["Python", "TensorFlow", "PyTorch", "NumPy", "React"],
    dateRange: "Aug 2024 - Oct 2024",
    bullets: [
      "Trained a reinforcement-learning poker agent using CFR minimization with a 70% heads-up win rate.",
      "Built a simulation and experiment pipeline across 100,000+ runs to track convergence and regressions.",
    ],
  },
];

export const certifications: CertificationItem[] = [
  {
    name: "Back-End Developer Professional (Meta)",
    date: "Jan 2025",
  },
  {
    name: "Machine Learning Engineer (Google)",
    date: "Oct 2024",
  },
];

export const courseworkTimeline: SemesterCourseNode[] = [
  {
    id: "cs180",
    label: "CS 180",
    semester: "Fall",
    year: 2023,
    level: 1,
    track: 0,
    dependsOn: [],
  },
  {
    id: "cs193",
    label: "CS 193",
    semester: "Fall",
    year: 2023,
    level: 1,
    track: 1,
    dependsOn: [],
  },
  {
    id: "ma162",
    label: "MA 162",
    semester: "Fall",
    year: 2023,
    level: 1,
    track: 2,
    dependsOn: [],
  },
  {
    id: "cs182",
    label: "CS 182",
    semester: "Spring",
    year: 2024,
    level: 2,
    track: 0,
    dependsOn: ["cs180"],
  },
  {
    id: "cs240",
    label: "CS 240",
    semester: "Spring",
    year: 2024,
    level: 2,
    track: 1,
    dependsOn: ["cs180"],
  },
  {
    id: "ma261",
    label: "MA 261",
    semester: "Spring",
    year: 2024,
    level: 2,
    track: 2,
    dependsOn: ["ma162"],
  },
  {
    id: "stat350",
    label: "STAT 350",
    semester: "Summer",
    year: 2024,
    level: 3,
    track: 0,
    dependsOn: ["ma261"],
  },
  {
    id: "cs251",
    label: "CS 251",
    semester: "Fall",
    year: 2024,
    level: 4,
    track: 0,
    dependsOn: ["cs182"],
  },
  {
    id: "cs250",
    label: "CS 250",
    semester: "Fall",
    year: 2024,
    level: 4,
    track: 1,
    dependsOn: ["cs240"],
  },
  {
    id: "cs252",
    label: "CS 252",
    semester: "Spring",
    year: 2025,
    level: 5,
    track: 0,
    dependsOn: ["cs250"],
  },
  {
    id: "ma351",
    label: "MA 351",
    semester: "Spring",
    year: 2025,
    level: 5,
    track: 1,
    dependsOn: ["ma261"],
  },
  {
    id: "cs354",
    label: "CS 354",
    semester: "Fall",
    year: 2025,
    level: 6,
    track: 0,
    dependsOn: ["cs252"],
  },
  {
    id: "cs489",
    label: "CS 489",
    semester: "Fall",
    year: 2025,
    level: 6,
    track: 1,
    dependsOn: ["cs252"],
  },
  {
    id: "cs352",
    label: "CS 352",
    semester: "Spring",
    year: 2026,
    level: 7,
    track: 0,
    dependsOn: ["cs252"],
  },
  {
    id: "cs307",
    label: "CS 307",
    semester: "Spring",
    year: 2026,
    level: 7,
    track: 1,
    dependsOn: ["cs251"],
  },
];

const SKILL_SIZE_MIN = 0.92;
const SKILL_SIZE_MAX = 4.45;

const skillSeeds: Array<Pick<SkillBubble, "id" | "label" | "category" | "hue">> = [
  { id: "java", label: "Java", category: "backend", hue: 24 },
  { id: "spring", label: "Spring Boot", category: "backend", hue: 24 },
  { id: "typescript", label: "TypeScript", category: "frontend", hue: 204 },
  { id: "react", label: "React", category: "frontend", hue: 204 },
  { id: "node", label: "Node.js", category: "backend", hue: 24 },
  { id: "express", label: "Express", category: "backend", hue: 24 },
  { id: "python", label: "Python", category: "data", hue: 54 },
  { id: "sql", label: "SQL", category: "data", hue: 54 },
  { id: "angular", label: "Angular", category: "frontend", hue: 204 },
  { id: "docker", label: "Docker", category: "infra", hue: 152 },
  { id: "oauth", label: "OAuth2", category: "systems", hue: 330 },
  { id: "systems", label: "Systems Design", category: "systems", hue: 330 },
  { id: "observability", label: "Observability", category: "infra", hue: 152 },
  { id: "ml", label: "Machine Learning", category: "data", hue: 54 },
  { id: "cloudflare", label: "Cloudflare", category: "infra", hue: 152 },
  { id: "ci", label: "CI/CD", category: "infra", hue: 152 },
  { id: "postgres", label: "PostgreSQL", category: "backend", hue: 24 },
  { id: "llm", label: "LLM Products", category: "data", hue: 54 },
  { id: "api", label: "API Design", category: "backend", hue: 24 },
  { id: "testing", label: "Regression Testing", category: "systems", hue: 330 },
  { id: "redis", label: "Redis", category: "backend", hue: 24 },
  { id: "graphql", label: "GraphQL", category: "frontend", hue: 204 },
  { id: "numpy", label: "NumPy", category: "data", hue: 54 },
  { id: "aws", label: "AWS", category: "infra", hue: 152 },
  { id: "linux", label: "Linux", category: "systems", hue: 330 },
  { id: "cpp", label: "C++", category: "systems", hue: 330 },
];

function hashSkillId(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 33 + char.charCodeAt(0)) % 1_000_003;
  }
  return hash;
}

function getSeededSkillSize(id: string): number {
  const normalized = (hashSkillId(id) % 1000) / 999;
  return Number((SKILL_SIZE_MIN + normalized * (SKILL_SIZE_MAX - SKILL_SIZE_MIN)).toFixed(3));
}

function getSkillWeight(size: number): number {
  const normalized = (size - SKILL_SIZE_MIN) / (SKILL_SIZE_MAX - SKILL_SIZE_MIN);
  return Number((0.9 + normalized * 0.8).toFixed(3));
}

export const initialSkills: SkillBubble[] = skillSeeds.map((seed) => {
  const size = getSeededSkillSize(seed.id);

  return {
    ...seed,
    size,
    baseSize: size,
    weight: getSkillWeight(size),
  };
});

export const musicCatalog: MusicTrack[] = [
  {
    id: "track-1",
    title: "Granular Light",
    artist: "North Axis",
    album: "Transit Glow",
    durationMs: 224000,
  },
  {
    id: "track-2",
    title: "Signal Bloom",
    artist: "Paper Relay",
    album: "Circuit Petals",
    durationMs: 207000,
  },
  {
    id: "track-3",
    title: "Static Harbor",
    artist: "Arc Manual",
    album: "Harbor Codes",
    durationMs: 248000,
  },
  {
    id: "track-4",
    title: "Orbit for Two",
    artist: "Cinder Vale",
    album: "Low Earth Summer",
    durationMs: 198000,
  },
  {
    id: "track-5",
    title: "Paper Satellites",
    artist: "Luma Coast",
    album: "Night Transit",
    durationMs: 236000,
  },
  {
    id: "track-6",
    title: "Velvet Algorithms",
    artist: "Blue Metric",
    album: "Signal Hearts",
    durationMs: 255000,
  },
  {
    id: "track-7",
    title: "Second Sunrise",
    artist: "Hollow Metro",
    album: "After Images",
    durationMs: 213000,
  },
  {
    id: "track-8",
    title: "Midnight Compile",
    artist: "Rare Leisure",
    album: "Terminal Lights",
    durationMs: 231000,
  },
  {
    id: "track-9",
    title: "Echoes in Indigo",
    artist: "Atlas Run",
    album: "Glass Weather",
    durationMs: 244000,
  },
  {
    id: "track-10",
    title: "Soft Focus Run",
    artist: "Neon Orchard",
    album: "Open Windows",
    durationMs: 205000,
  },
];

export const interests = [
  "Fantasy Soccer",
  "Poker",
  "Sports Betting Markets",
  "Video Editing",
  "Weight Lifting",
];
