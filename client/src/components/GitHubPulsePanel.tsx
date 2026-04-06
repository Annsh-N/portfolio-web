import { FolderGit2, GitCommitHorizontal, Sparkles, Star } from "lucide-react";
import type { GitHubSnapshot } from "@shared/types";

type GitHubPulsePanelProps = {
  snapshot: GitHubSnapshot;
};

function formatRelativeDate(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) >= 1) {
    return formatter.format(diffDays, "day");
  }

  const diffHours = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHours) >= 1) {
    return formatter.format(diffHours, "hour");
  }

  const diffMinutes = Math.round(diffMs / 60_000);
  return formatter.format(diffMinutes, "minute");
}

function getCommitLevel(count: number, peak: number) {
  if (count <= 0) return "none";
  if (peak <= 1) return "high";

  const ratio = count / peak;
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.45) return "medium";
  return "low";
}

export function GitHubPulsePanel({ snapshot }: GitHubPulsePanelProps) {
  const peak = Math.max(...snapshot.days.map((day) => day.count), 1);

  return (
    <div className="portrait-activity-stack">
      <article className="metric-card github-pulse-card">
        <strong className="github-pulse-title">GitHub activity</strong>

        <div className="github-pulse-body">
          <div className="github-pulse-graph" role="img" aria-label={`GitHub contributions from the last ${snapshot.days.length} days`}>
            {snapshot.days.map((day) => (
              <div className="github-pulse-day" key={day.date}>
                <div
                  className={`github-pulse-cell is-${getCommitLevel(day.count, peak)}`}
                  title={`${day.count} contributions on ${day.date}`}
                />
              </div>
            ))}
          </div>

          <div className="github-pulse-stats">
            <div className="github-pulse-stat">
              <span>{snapshot.recentContributions}</span>
              <small>last {snapshot.days.length}d</small>
            </div>
            <div className="github-pulse-stat">
              <span>{snapshot.yearContributions}</span>
              <small>in 2026</small>
            </div>
          </div>
        </div>
      </article>

      <div className="portrait-grid github-repo-grid">
        <a className="metric-card github-repo-card" href={snapshot.lastRepo?.htmlUrl ?? "#"} rel="noreferrer" target="_blank">
          <div className="github-card-kicker">
            <FolderGit2 size={12} />
            <span>Last worked on</span>
          </div>
          <strong>{snapshot.lastRepo?.fullName ?? "No recent repository"}</strong>
          <div className="github-card-meta">
            <span>{snapshot.lastRepo?.language ?? "Private / mixed"}</span>
            <span>{snapshot.lastRepo ? `Updated ${formatRelativeDate(snapshot.lastRepo.pushedAt)}` : "Awaiting data"}</span>
          </div>
        </a>

        <a className="metric-card github-repo-card github-feature-card" href={snapshot.featuredRepo?.htmlUrl ?? "#"} rel="noreferrer" target="_blank">
          <div className="github-card-kicker">
            <Sparkles size={12} />
            <span>Repo of the week</span>
          </div>
          <strong>{snapshot.featuredRepo?.fullName ?? "Featured repository"}</strong>
          <div className="github-card-meta github-card-meta-stack">
            <span>
              <GitCommitHorizontal size={13} />
              {snapshot.featuredRepo?.language ?? "Open source"}
            </span>
            <span>
              <Star size={13} />
              {snapshot.featuredRepo ? `${snapshot.featuredRepo.stars.toLocaleString()} stars` : "Popular"}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
