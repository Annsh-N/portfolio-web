import { Pause, Play, Plus, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import type { MusicTrack } from "@shared/types";
import { formatDuration } from "@/lib/format";

type MusicMiniPlayerProps = {
  currentTrack: MusicTrack;
  queue: MusicTrack[];
  onTogglePlayback: () => void;
  onQueueTrack: (id: string) => void;
  condensed: boolean;
};

export function MusicMiniPlayer({
  condensed,
  currentTrack,
  queue,
  onTogglePlayback,
  onQueueTrack,
}: MusicMiniPlayerProps) {
  const [open, setOpen] = useState(false);
  const progress = useMemo(
    () => Math.min(100, (currentTrack.progressMs / currentTrack.durationMs) * 100),
    [currentTrack.durationMs, currentTrack.progressMs],
  );

  return (
    <div className={`player-shell ${open ? "is-open" : ""} ${condensed ? "is-condensed" : ""}`}>
      <button className="player-compact" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="player-icon">
          <Waves size={16} />
        </span>
        <span className="player-copy">
          <strong>{currentTrack.title}</strong>
          {!condensed ? <small>{currentTrack.artist}</small> : null}
        </span>
        <span className="player-progress">
          {!condensed ? (
            <small>
              {formatDuration(currentTrack.progressMs)} / {formatDuration(currentTrack.durationMs)}
            </small>
          ) : null}
          <span className="player-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </span>
        </span>
      </button>

      {open ? (
        <div className="player-popover">
          <div className="player-popover-header">
            <div>
              <span className="eyebrow">Now Playing</span>
              <strong>{currentTrack.title}</strong>
              <small>{currentTrack.artist}</small>
            </div>
            <button className="icon-button" type="button" onClick={onTogglePlayback}>
              {currentTrack.isPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>

          <div className="player-queue">
            {queue.map((track) => (
              <button
                className={`queue-row ${track.id === currentTrack.id ? "is-current" : ""}`}
                key={track.id}
                type="button"
                onClick={() => onQueueTrack(track.id)}
              >
                <span>
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </span>
                <span className="queue-meta">
                  <Plus size={14} />
                  {formatDuration(track.durationMs)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
