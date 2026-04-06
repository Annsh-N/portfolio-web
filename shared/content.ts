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

export const initialSkills: SkillBubble[] = [
  { id: "java", label: "Java", size: 1.14, baseSize: 1.14, weight: 1.08, hue: 26 },
  { id: "spring", label: "Spring Boot", size: 1.11, baseSize: 1.11, weight: 1.05, hue: 92 },
  { id: "typescript", label: "TypeScript", size: 1.09, baseSize: 1.09, weight: 1.04, hue: 204 },
  { id: "react", label: "React", size: 1.04, baseSize: 1.04, weight: 1.01, hue: 190 },
  { id: "node", label: "Node.js", size: 1.03, baseSize: 1.03, weight: 1.0, hue: 132 },
  { id: "express", label: "Express", size: 0.98, baseSize: 0.98, weight: 0.97, hue: 214 },
  { id: "python", label: "Python", size: 1.08, baseSize: 1.08, weight: 1.03, hue: 54 },
  { id: "sql", label: "SQL", size: 0.96, baseSize: 0.96, weight: 0.94, hue: 14 },
  { id: "angular", label: "Angular", size: 0.94, baseSize: 0.94, weight: 0.93, hue: 354 },
  { id: "docker", label: "Docker", size: 0.95, baseSize: 0.95, weight: 0.95, hue: 205 },
  { id: "oauth", label: "OAuth2", size: 0.89, baseSize: 0.89, weight: 0.88, hue: 280 },
  { id: "systems", label: "Systems Design", size: 1.05, baseSize: 1.05, weight: 1.02, hue: 238 },
  { id: "observability", label: "Observability", size: 0.92, baseSize: 0.92, weight: 0.9, hue: 160 },
  { id: "ml", label: "Machine Learning", size: 0.98, baseSize: 0.98, weight: 0.96, hue: 42 },
  { id: "cloudflare", label: "Cloudflare", size: 0.87, baseSize: 0.87, weight: 0.87, hue: 22 },
  { id: "ci", label: "CI/CD", size: 0.91, baseSize: 0.91, weight: 0.9, hue: 124 },
  { id: "postgres", label: "PostgreSQL", size: 0.9, baseSize: 0.9, weight: 0.89, hue: 226 },
  { id: "llm", label: "LLM Products", size: 0.93, baseSize: 0.93, weight: 0.92, hue: 306 },
  { id: "api", label: "API Design", size: 0.96, baseSize: 0.96, weight: 0.94, hue: 186 },
  { id: "testing", label: "Regression Testing", size: 0.88, baseSize: 0.88, weight: 0.86, hue: 12 },
];

export const mockTracks: MusicTrack[] = [
  {
    id: "track-1",
    title: "Granular Light",
    artist: "North Axis",
    durationMs: 224000,
    progressMs: 92000,
    isPlaying: true,
  },
  {
    id: "track-2",
    title: "Signal Bloom",
    artist: "Paper Relay",
    durationMs: 207000,
    progressMs: 0,
    isPlaying: false,
  },
  {
    id: "track-3",
    title: "Static Harbor",
    artist: "Arc Manual",
    durationMs: 248000,
    progressMs: 0,
    isPlaying: false,
  },
];

export const interests = [
  "Fantasy Soccer",
  "Poker",
  "Sports Betting Markets",
  "Video Editing",
  "Weight Lifting",
];
