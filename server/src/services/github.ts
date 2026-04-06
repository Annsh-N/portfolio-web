import type { GitHubActivityDay, GitHubRepoSummary, GitHubSnapshot } from "../../../shared/types.js";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? "Annsh-N";
const GITHUB_FEATURED_REPO = process.env.GITHUB_FEATURED_REPO ?? "google/gemma.cpp";
const CACHE_TTL_MS = 1000 * 60 * 10;
const RECENT_REPO_LIMIT = 6;
const DAY_WINDOW = 28;

let githubCache: { expiresAt: number; value: GitHubSnapshot } | null = null;

type GitHubRepoApi = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
};

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-web",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubApiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

async function githubHtmlRequest(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "portfolio-web",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub page request failed: ${response.status}`);
  }

  return response.text();
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDayWindow() {
  const today = new Date();
  const days: GitHubActivityDay[] = [];

  for (let offset = DAY_WINDOW - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    days.push({
      date: formatIsoDate(day),
      count: 0,
    });
  }

  return days;
}

function toRepoSummary(repo: GitHubRepoApi): GitHubRepoSummary {
  return {
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
  };
}

function emptySnapshot(): GitHubSnapshot {
  return {
    username: GITHUB_USERNAME,
    days: buildDayWindow(),
    recentContributions: 0,
    yearContributions: 0,
    lastRepo: null,
    featuredRepo: null,
    fetchedAt: new Date().toISOString(),
  };
}

function parseContributionCount(text: string) {
  if (/No contributions/i.test(text)) return 0;
  const match = text.match(/([\d,]+)\s+contributions?/i);
  return match ? Number(match[1].replaceAll(",", "")) : 0;
}

function parseContributionCalendar(html: string, currentYear: number) {
  const totalMatch = html.match(/>\s*([\d,]+)\s+contributions?\s+in\s+\d{4}\s*</i);
  const yearContributions = totalMatch ? Number(totalMatch[1].replaceAll(",", "")) : 0;
  const counts = new Map<string, number>();

  const cellRegex =
    /data-date="(?<date>\d{4}-\d{2}-\d{2})"[^>]*class="ContributionCalendar-day"[^>]*><\/td>\s*<tool-tip[^>]*>(?<tooltip>[^<]+)<\/tool-tip>/g;

  for (const match of html.matchAll(cellRegex)) {
    const date = match.groups?.date;
    const tooltip = match.groups?.tooltip;
    if (!date || !tooltip || !date.startsWith(String(currentYear))) continue;
    counts.set(date, parseContributionCount(tooltip));
  }

  return { yearContributions, counts };
}

export async function getGitHubSnapshot(): Promise<GitHubSnapshot> {
  if (githubCache && githubCache.expiresAt > Date.now()) {
    return githubCache.value;
  }

  try {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    const [allRepos, featuredRepo, contributionsHtml] = await Promise.all([
      githubApiRequest<GitHubRepoApi[]>(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
      githubApiRequest<GitHubRepoApi>(`https://api.github.com/repos/${GITHUB_FEATURED_REPO}`),
      githubHtmlRequest(`https://github.com/users/${GITHUB_USERNAME}/contributions?from=${yearStart}&to=${yearEnd}`),
    ]);

    const recentRepos = allRepos.slice(0, RECENT_REPO_LIMIT);
    const { yearContributions, counts } = parseContributionCalendar(contributionsHtml, currentYear);
    const dayWindow = buildDayWindow().map((day) => ({
      ...day,
      count: counts.get(day.date) ?? 0,
    }));

    const snapshot: GitHubSnapshot = {
      username: GITHUB_USERNAME,
      days: dayWindow,
      recentContributions: dayWindow.reduce((sum, day) => sum + day.count, 0),
      yearContributions,
      lastRepo: recentRepos[0] ? toRepoSummary(recentRepos[0]) : null,
      featuredRepo: toRepoSummary(featuredRepo),
      fetchedAt: new Date().toISOString(),
    };

    githubCache = {
      value: snapshot,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return snapshot;
  } catch {
    const fallback = emptySnapshot();
    githubCache = {
      value: fallback,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    return fallback;
  }
}
