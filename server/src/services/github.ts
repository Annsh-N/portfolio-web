export type GitHubContribution = {
  date: string;
  count: number;
  level: number;
};

export type GitHubContributionSnapshot = {
  total: number;
  contributions: GitHubContribution[];
  fetchedAt: string;
};

const profileUrl = "https://github.com/users/Annsh-N/contributions";
const cacheDurationMs = 15 * 60 * 1000;

let cachedSnapshot: GitHubContributionSnapshot | undefined;
let cacheExpiresAt = 0;

function parseContributions(html: string): GitHubContribution[] {
  const contributions: GitHubContribution[] = [];
  const cellPattern = /<td\b([^>]*\bdata-date="[^"]+"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;

  for (const match of html.matchAll(cellPattern)) {
    const attributes = match[1] ?? "";
    const tooltip = match[2] ?? "";
    const date = attributes.match(/\bdata-date="([^"]+)"/)?.[1];
    const level = Number(attributes.match(/\bdata-level="([0-4])"/)?.[1]);
    const countText = tooltip.match(/([\d,]+) contributions?/)?.[1];

    if (!date || !Number.isInteger(level)) {
      continue;
    }

    contributions.push({
      date,
      level,
      count: countText ? Number(countText.replaceAll(",", "")) : 0,
    });
  }

  return contributions.sort((left, right) => left.date.localeCompare(right.date));
}

export async function getGitHubContributionSnapshot(): Promise<GitHubContributionSnapshot> {
  if (cachedSnapshot && Date.now() < cacheExpiresAt) {
    return cachedSnapshot;
  }

  try {
    const response = await fetch(profileUrl, {
      headers: {
        Accept: "text/html",
        "User-Agent": "annshnavle.dev contribution calendar",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const contributions = parseContributions(await response.text());
    if (contributions.length < 300) {
      throw new Error("GitHub contribution calendar was incomplete");
    }

    cachedSnapshot = {
      contributions,
      total: contributions.reduce((sum, day) => sum + day.count, 0),
      fetchedAt: new Date().toISOString(),
    };
    cacheExpiresAt = Date.now() + cacheDurationMs;
    return cachedSnapshot;
  } catch (error) {
    if (cachedSnapshot) {
      return cachedSnapshot;
    }
    throw error;
  }
}
