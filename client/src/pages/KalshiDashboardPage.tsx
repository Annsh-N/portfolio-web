import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchKalshiPublicSnapshot } from "@/lib/api";
import type { KalshiPublicSnapshot } from "@shared/types";

const unavailableSnapshot: KalshiPublicSnapshot = {
  status: "offline",
  updatedAt: null,
  uptimeSeconds: null,
  trackedMarkets: null,
  decisionsToday: null,
  fillsToday: null,
  marketDataAgeMs: null,
  note: "The public telemetry feed is not connected on this deployment.",
};

function formatUptime(seconds: number | null) {
  if (seconds === null) return "—";
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "no snapshot";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export function KalshiDashboardPage() {
  const [snapshot, setSnapshot] = useState<KalshiPublicSnapshot>(unavailableSnapshot);

  useEffect(() => {
    let active = true;

    const refresh = () => {
      fetchKalshiPublicSnapshot()
        .then((next) => {
          if (active) setSnapshot(next);
        })
        .catch(() => {
          if (active) setSnapshot(unavailableSnapshot);
        });
    };

    refresh();
    const interval = window.setInterval(refresh, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="notebook-page telemetry-page">
      <Link className="back-link" to="/fun">
        ← fun / lab
      </Link>

      <header className="page-header telemetry-header">
        <div>
          <p className="kicker">public surface / delayed and read-only</p>
          <h1>Kalshi bot telemetry</h1>
          <p>
            A narrow operational window into the trading system. The public feed exposes health and aggregate
            activity, never credentials, positions, orders, strategy parameters, or live signals.
          </p>
        </div>
        <div className={`telemetry-status is-${snapshot.status}`}>
          <span aria-hidden="true" />
          {snapshot.status}
        </div>
      </header>

      <section className="telemetry-grid" aria-label="Public bot metrics">
        <div className="telemetry-cell">
          <span>process uptime</span>
          <strong>{formatUptime(snapshot.uptimeSeconds)}</strong>
        </div>
        <div className="telemetry-cell">
          <span>markets observed</span>
          <strong>{snapshot.trackedMarkets ?? "—"}</strong>
        </div>
        <div className="telemetry-cell">
          <span>decisions today</span>
          <strong>{snapshot.decisionsToday ?? "—"}</strong>
        </div>
        <div className="telemetry-cell">
          <span>fills today</span>
          <strong>{snapshot.fillsToday ?? "—"}</strong>
        </div>
        <div className="telemetry-cell">
          <span>market data age</span>
          <strong>{snapshot.marketDataAgeMs === null ? "—" : `${snapshot.marketDataAgeMs} ms`}</strong>
        </div>
        <div className="telemetry-cell">
          <span>last public snapshot</span>
          <strong className="telemetry-timestamp">{formatTimestamp(snapshot.updatedAt)}</strong>
        </div>
      </section>

      <section className="telemetry-log">
        <div className="telemetry-log-head">
          <span>public-feed.log</span>
          <span>refresh: 30s</span>
        </div>
        <p>
          <span>&gt;</span> {snapshot.note}
        </p>
        <p>
          <span>&gt;</span> Detailed execution data remains on the private dashboard.
        </p>
      </section>

      <section className="telemetry-boundary">
        <h2>What this page is allowed to know</h2>
        <div>
          <p>
            <strong>Published:</strong> service mode, coarse uptime, aggregate counts, feed freshness, and a status
            note written by the bot.
          </p>
          <p>
            <strong>Private:</strong> credentials, balances, positions, contract IDs, order details, model inputs,
            strategy thresholds, and anything useful for front-running the system.
          </p>
        </div>
      </section>
    </div>
  );
}
