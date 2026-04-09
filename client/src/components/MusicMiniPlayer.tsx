import { Clock3, Search, Send, Waves } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { MusicSnapshot, MusicTrack } from "@shared/types";
import { searchMusicCatalog } from "@/lib/api";
import { formatDuration } from "@/lib/format";

type MusicMiniPlayerProps = {
  condensed: boolean;
  music: MusicSnapshot;
  onRecommendTrack: (trackId: string, note: string) => Promise<void>;
};

type MusicTab = "recent" | "recommend";

function formatPlayedAt(input: string): string {
  const elapsedMs = Date.now() - Date.parse(input);
  const elapsedMinutes = Math.max(0, Math.round(elapsedMs / 60_000));

  if (elapsedMinutes < 1) {
    return "just now";
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(input));
}

export function MusicMiniPlayer({ condensed, music, onRecommendTrack }: MusicMiniPlayerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MusicTab>("recent");
  const [query, setQuery] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!open || activeTab !== "recommend") {
      return;
    }

    if (!deferredQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchMusicCatalog(deferredQuery)
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setResults(payload.results);
        setSelectedTrackId((current) =>
          payload.results.some((track) => track.id === current) ? current : (payload.results[0]?.id ?? ""),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, deferredQuery, open]);

  const recommendResults = useMemo(
    () =>
      deferredQuery.trim()
        ? results.slice(0, 3)
        : music.recentTracks.slice(0, 3).map(({ playedAt: _playedAt, ...track }) => track),
    [deferredQuery, music.recentTracks, results],
  );

  useEffect(() => {
    setSelectedTrackId((current) =>
      recommendResults.some((track) => track.id === current) ? current : (recommendResults[0]?.id ?? ""),
    );
  }, [recommendResults]);

  const selectedTrack = useMemo(
    () => recommendResults.find((track) => track.id === selectedTrackId) ?? null,
    [recommendResults, selectedTrackId],
  );

  async function handleSubmitRecommendation() {
    if (!selectedTrack || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await onRecommendTrack(selectedTrack.id, "");
      setFeedback(`Queued ${selectedTrack.title} for review.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not send recommendation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`player-shell ${open ? "is-open" : ""} ${condensed ? "is-condensed" : ""}`}>
      <button className="player-compact" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="player-icon">
          <Waves size={16} />
        </span>
        <span className="player-copy">
          <small>Last played</small>
          <strong>{music.lastPlayed?.title ?? "No recent track"}</strong>
          {!condensed ? <small>{music.lastPlayed?.artist ?? "Waiting for sync"}</small> : null}
        </span>
        {!condensed ? <span className="player-chip">{music.recentTracks.length} recent</span> : null}
      </button>

      {open ? (
        <div className="player-popover">
          <div className="player-tab-row" role="tablist" aria-label="Music menu">
            <button
              className={`player-tab ${activeTab === "recent" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTab("recent")}
            >
              Recent
            </button>
            <button
              className={`player-tab ${activeTab === "recommend" ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTab("recommend")}
            >
              Recommend
            </button>
          </div>

          {activeTab === "recent" ? (
            <div className="player-history">
              {music.recentTracks.map((track) => (
                <article className="history-row" key={`${track.id}-${track.playedAt}`}>
                  <span className="history-icon">
                    <Clock3 size={14} />
                  </span>
                  <span className="history-copy">
                    <strong>{track.title}</strong>
                    <small>
                      {track.artist} • {track.album}
                    </small>
                  </span>
                  <span className="history-meta">
                    <small>{formatPlayedAt(track.playedAt)}</small>
                    <small>{formatDuration(track.durationMs)}</small>
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="player-recommend">
              <label className="music-search">
                <Search size={15} />
                <input
                  placeholder="Search the catalog"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="catalog-results" role="listbox" aria-label="Catalog results">
                {isSearching ? (
                  <div className="catalog-empty">Searching...</div>
                ) : recommendResults.length ? (
                  recommendResults.map((track) => (
                    <button
                      className={`catalog-row ${track.id === selectedTrackId ? "is-selected" : ""}`}
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrackId(track.id)}
                    >
                      <span>
                        <strong>{track.title}</strong>
                        <small>
                          {track.artist} • {track.album}
                        </small>
                      </span>
                      <small>{formatDuration(track.durationMs)}</small>
                    </button>
                  ))
                ) : (
                  <div className="catalog-empty">
                    {deferredQuery.trim() ? "No songs matched that search." : "No recent songs available."}
                  </div>
                )}
              </div>

              <button
                className="music-submit"
                disabled={!selectedTrack || isSubmitting}
                type="button"
                onClick={handleSubmitRecommendation}
              >
                <Send size={14} />
                {isSubmitting ? "Sending..." : `Recommend ${selectedTrack?.title ?? "song"}`}
              </button>

              {feedback ? <p className="music-feedback">{feedback}</p> : null}

              {music.recommendations.length ? (
                <div className="music-recommendation-log">
                  <span className="eyebrow">Recent requests</span>
                  <div className="music-recommendation-list">
                    {music.recommendations.slice(0, 3).map((track) => (
                      <div className="music-recommendation-item" key={track.recommendationId}>
                        <strong>{track.title}</strong>
                        <small>{track.artist}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
