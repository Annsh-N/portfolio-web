import { useEffect, useMemo, useRef, useState } from "react";

type WindowTab = "about" | "github";

type Contribution = {
  date: string;
  count: number;
  level: number;
};

type ContributionSnapshot = {
  total: number;
  contributions: Contribution[];
  fetchedAt: string;
};

type AboutWindowProps = {
  paragraphs: string[];
  githubUrl: string;
};

const tabs: WindowTab[] = ["about", "github"];

function formatContributionLabel(contribution: Contribution): string {
  const date = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${contribution.date}T00:00:00Z`));
  const unit = contribution.count === 1 ? "contribution" : "contributions";
  return `${contribution.count} ${unit} on ${date}`;
}

function ContributionChart({ githubUrl, snapshot }: { githubUrl: string; snapshot: ContributionSnapshot }) {
  const chart = useMemo(() => {
    const firstDate = snapshot.contributions[0]?.date;
    const leadingDays = firstDate ? new Date(`${firstDate}T00:00:00Z`).getUTCDay() : 0;
    const days: Array<Contribution | null> = [
      ...Array.from<null>({ length: leadingDays }).fill(null),
      ...snapshot.contributions,
    ];
    const weekCount = Math.ceil(days.length / 7);
    const months: Array<{ key: string; label: string; column: number }> = [];
    const seenMonths = new Set<string>();

    snapshot.contributions.forEach((contribution, index) => {
      const date = new Date(`${contribution.date}T00:00:00Z`);
      const key = contribution.date.slice(0, 7);
      if (date.getUTCDate() <= 7 && !seenMonths.has(key)) {
        seenMonths.add(key);
        months.push({
          key,
          label: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" })
            .format(date)
            .toLowerCase(),
          column: Math.floor((leadingDays + index) / 7) + 1,
        });
      }
    });

    return { days, months, weekCount };
  }, [snapshot]);

  const gridColumns = `repeat(${chart.weekCount}, minmax(0, 1fr))`;

  return (
    <div className="contribution-view">
      <div className="contribution-summary">
        <span>
          <strong>{snapshot.total.toLocaleString()}</strong> contributions in the last year
        </span>
        <a href={githubUrl} rel="noreferrer" target="_blank">
          Annsh-N ↗
        </a>
      </div>

      <div className="contribution-chart" aria-label={`${snapshot.total} GitHub contributions in the last year`}>
        <div className="contribution-months" aria-hidden="true" style={{ gridTemplateColumns: gridColumns }}>
          {chart.months.map((month) => (
            <span key={month.key} style={{ gridColumn: `${month.column} / span 4` }}>
              {month.label}
            </span>
          ))}
        </div>
        <div className="contribution-grid" style={{ gridTemplateColumns: gridColumns }}>
          {chart.days.map((contribution, index) =>
            contribution ? (
              <span
                aria-label={formatContributionLabel(contribution)}
                className={`contribution-cell level-${contribution.level}`}
                key={contribution.date}
                role="img"
                title={formatContributionLabel(contribution)}
              />
            ) : (
              <span aria-hidden="true" className="contribution-cell is-empty" key={`empty-${index}`} />
            ),
          )}
        </div>
      </div>

      <div className="contribution-legend" aria-hidden="true">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i className={`contribution-cell level-${level}`} key={level} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

export function AboutWindow({ paragraphs, githubUrl }: AboutWindowProps) {
  const [activeTab, setActiveTab] = useState<WindowTab>("about");
  const [snapshot, setSnapshot] = useState<ContributionSnapshot>();
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (activeTab !== "github" || snapshot || loadState !== "loading") {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/github/contributions", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load GitHub contributions");
        }
        return (await response.json()) as ContributionSnapshot;
      })
      .then((nextSnapshot) => {
        setSnapshot(nextSnapshot);
        setLoadState("idle");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadState("error");
      });

    return () => controller.abort();
  }, [activeTab, loadState, snapshot]);

  function selectTab(tab: WindowTab): void {
    if (tab === "github" && !snapshot && loadState !== "loading") {
      setLoadState("loading");
    }
    setActiveTab(tab);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    selectTab(tabs[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <aside className="about-window" aria-label="About Annsh and GitHub activity">
      <div className="window-titlebar">
        <span className="window-shell-mark" aria-hidden="true">
          ~/ 
        </span>
        <span className="window-title">annsh@portfolio:~</span>
        <span className="window-controls" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="window-tabs" role="tablist" aria-label="Window views">
        {tabs.map((tab, index) => (
          <button
            aria-controls={`window-panel-${tab}`}
            aria-selected={activeTab === tab}
            className="window-tab"
            id={`window-tab-${tab}`}
            key={tab}
            onClick={() => selectTab(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={activeTab === tab ? 0 : -1}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`window-tab-${activeTab}`}
        className={`window-panel window-panel-${activeTab}`}
        id={`window-panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === "about" ? (
          <div className="about-copy">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : snapshot ? (
          <ContributionChart githubUrl={githubUrl} snapshot={snapshot} />
        ) : loadState === "error" ? (
          <div className="window-message" role="status">
            <p>GitHub activity could not be reached.</p>
            <button onClick={() => setLoadState("loading")} type="button">
              try again
            </button>
          </div>
        ) : (
          <p className="window-loading" role="status">
            fetching contribution history…
          </p>
        )}
      </div>
    </aside>
  );
}
