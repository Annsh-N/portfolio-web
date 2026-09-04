import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";

type WindowTab = "about" | "github";

type Contribution = {
  date: string;
  count: number;
  level: number;
};

type ContributionSnapshot = {
  year: number;
  total: number;
  contributions: Contribution[];
  fetchedAt: string;
};

type WindowPosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type WindowSize = {
  width?: number;
  height?: number;
};

type ResizeState = {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type AboutWindowProps = {
  paragraphs: string[];
  githubUrl: string;
};

const tabs: WindowTab[] = ["about", "github"];

function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value));
}

function clampBetween(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function getMoveLimits(): WindowPosition {
  const compact = window.matchMedia("(max-width: 820px)").matches;
  return compact ? { x: 10, y: 10 } : { x: 36, y: 28 };
}

function getResizeBounds(element: HTMLElement): {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
} {
  const parentWidth = element.parentElement?.getBoundingClientRect().width ?? element.getBoundingClientRect().width;
  const compact = window.matchMedia("(max-width: 820px)").matches;

  return {
    minWidth: compact ? parentWidth : Math.min(parentWidth, 416),
    maxWidth: compact ? parentWidth : parentWidth + 36,
    minHeight: 224,
    maxHeight: 304,
  };
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00Z`));
}

function formatContributionLabel(contribution: Contribution): string {
  const unit = contribution.count === 1 ? "contribution" : "contributions";
  return `${contribution.count} ${unit} on ${formatDate(contribution.date)}`;
}

function ContributionChart({ githubUrl, snapshot }: { githubUrl: string; snapshot: ContributionSnapshot }) {
  const chart = useMemo(() => {
    const year = snapshot.year ?? new Date().getUTCFullYear();
    const contributions = snapshot.contributions.filter((contribution) => contribution.date.startsWith(`${year}-`));
    const leadingDays = new Date(`${year}-01-01T00:00:00Z`).getUTCDay();
    const days: Array<Contribution | null> = [
      ...Array.from<null>({ length: leadingDays }).fill(null),
      ...contributions,
    ];
    const weekCount = Math.ceil(days.length / 7);
    const months: Array<{ key: string; label: string; column: number }> = [];
    const seenMonths = new Set<string>();

    contributions.forEach((contribution, index) => {
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

    const today = new Date().toISOString().slice(0, 10);
    const total = contributions
      .filter((contribution) => contribution.date <= today)
      .reduce((sum, contribution) => sum + contribution.count, 0);

    return { days, months, weekCount, today, total, year };
  }, [snapshot]);

  const gridColumns = `repeat(${chart.weekCount}, minmax(0, 1fr))`;

  return (
    <div className="contribution-view">
      <div className="contribution-summary">
        <span>
          <strong>{chart.total.toLocaleString()}</strong> contributions in {chart.year}
        </span>
        <a href={githubUrl} rel="noreferrer" target="_blank">
          Annsh-N ↗
        </a>
      </div>

      <div className="contribution-chart" aria-label={`${chart.total} GitHub contributions in ${chart.year}`}>
        <div className="contribution-months" aria-hidden="true" style={{ gridTemplateColumns: gridColumns }}>
          {chart.months.map((month) => (
            <span key={month.key} style={{ gridColumn: `${month.column} / span 4` }}>
              {month.label}
            </span>
          ))}
        </div>
        <div className="contribution-grid" style={{ gridTemplateColumns: gridColumns }}>
          {chart.days.map((contribution, index) => {
            const isFuture = contribution ? contribution.date > chart.today : false;
            return contribution ? (
              <span
                aria-label={
                  isFuture ? `${formatDate(contribution.date)}, future date` : formatContributionLabel(contribution)
                }
                className={`contribution-cell ${isFuture ? "is-future" : `level-${contribution.level}`}`}
                key={contribution.date}
                role="img"
                title={isFuture ? `${formatDate(contribution.date)} · not reached yet` : formatContributionLabel(contribution)}
              />
            ) : (
              <span aria-hidden="true" className="contribution-cell is-empty" key={`empty-${index}`} />
            );
          })}
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
  const [position, setPosition] = useState<WindowPosition>({ x: 0, y: 0 });
  const [size, setSize] = useState<WindowSize>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const windowRef = useRef<HTMLElement | null>(null);
  const dragState = useRef<DragState | undefined>(undefined);
  const resizeState = useRef<ResizeState | undefined>(undefined);

  useEffect(() => {
    if (activeTab !== "github" || snapshot || loadState !== "loading") {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/github/contributions?view=current-year", { signal: controller.signal })
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

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    selectTab(tabs[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleTitlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handleTitlePointerMove(event: ReactPointerEvent<HTMLDivElement>): void {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const limits = getMoveLimits();
    setPosition({
      x: clamp(drag.originX + event.clientX - drag.startX, limits.x),
      y: clamp(drag.originY + event.clientY - drag.startY, limits.y),
    });
  }

  function finishDragging(event: ReactPointerEvent<HTMLDivElement>): void {
    if (dragState.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragState.current = undefined;
    setIsDragging(false);
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const offsets: Partial<Record<string, WindowPosition>> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const offset = offsets[event.key];

    if (event.key === "Home") {
      event.preventDefault();
      setPosition({ x: 0, y: 0 });
      return;
    }
    if (!offset) {
      return;
    }

    event.preventDefault();
    const step = event.shiftKey ? 8 : 4;
    const limits = getMoveLimits();
    setPosition((current) => ({
      x: clamp(current.x + offset.x * step, limits.x),
      y: clamp(current.y + offset.y * step, limits.y),
    }));
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    const element = windowRef.current;
    if (event.button !== 0 || !element || window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const bounds = element.getBoundingClientRect();
    resizeState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: bounds.width,
      startHeight: bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
  }

  function handleResizePointerMove(event: ReactPointerEvent<HTMLButtonElement>): void {
    const resize = resizeState.current;
    const element = windowRef.current;
    if (!resize || !element || resize.pointerId !== event.pointerId) {
      return;
    }

    const bounds = getResizeBounds(element);
    setSize({
      width: clampBetween(resize.startWidth + event.clientX - resize.startX, bounds.minWidth, bounds.maxWidth),
      height: clampBetween(resize.startHeight + event.clientY - resize.startY, bounds.minHeight, bounds.maxHeight),
    });
  }

  function finishResizing(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (resizeState.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeState.current = undefined;
    setIsResizing(false);
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    const element = windowRef.current;
    if (!element) {
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setSize({});
      return;
    }

    const offsets: Partial<Record<string, WindowPosition>> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const offset = offsets[event.key];
    if (!offset) {
      return;
    }

    event.preventDefault();
    const current = element.getBoundingClientRect();
    const bounds = getResizeBounds(element);
    const step = event.shiftKey ? 16 : 8;
    setSize({
      width: clampBetween(current.width + offset.x * step, bounds.minWidth, bounds.maxWidth),
      height: clampBetween(current.height + offset.y * step, bounds.minHeight, bounds.maxHeight),
    });
  }

  return (
    <aside
      className={`about-window${isDragging ? " is-dragging" : ""}${isResizing ? " is-resizing" : ""}`}
      aria-label="About Annsh and GitHub activity"
      ref={windowRef}
      style={{ height: size.height, transform: `translate3d(${position.x}px, ${position.y}px, 0)`, width: size.width }}
    >
      <div
        aria-label="Movable window title bar. Use arrow keys to reposition and Home to reset."
        aria-roledescription="movable window title bar"
        className="window-titlebar"
        onDoubleClick={() => setPosition({ x: 0, y: 0 })}
        onKeyDown={handleTitleKeyDown}
        onLostPointerCapture={finishDragging}
        onPointerCancel={finishDragging}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={finishDragging}
        role="group"
        tabIndex={0}
        title="Drag to move · resize from the lower-right corner"
      >
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

      <button
        aria-label="Resize window. Use arrow keys to resize and Home to reset."
        className="window-resize-handle"
        onDoubleClick={() => setSize({})}
        onKeyDown={handleResizeKeyDown}
        onLostPointerCapture={finishResizing}
        onPointerCancel={finishResizing}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={finishResizing}
        title="Drag to resize"
        type="button"
      />
    </aside>
  );
}
