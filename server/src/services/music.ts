import { mockTracks } from "../../../shared/content.js";
import type { MusicTrack } from "../../../shared/types.js";

const cycleStartedAt = Date.now();
const trackGapMs = 8000;

export function getCurrentTrack(): MusicTrack {
  const totalDuration = mockTracks.reduce((sum, track) => sum + track.durationMs + trackGapMs, 0);
  const elapsed = (Date.now() - cycleStartedAt) % totalDuration;

  let cursor = 0;
  for (const track of mockTracks) {
    const trackStart = cursor;
    const trackEnd = cursor + track.durationMs;
    if (elapsed >= trackStart && elapsed < trackEnd) {
      return {
        ...track,
        progressMs: elapsed - trackStart,
        isPlaying: true,
      };
    }
    cursor = trackEnd + trackGapMs;
  }

  return {
    ...mockTracks[0],
    progressMs: 0,
    isPlaying: false,
  };
}
