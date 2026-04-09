import { randomUUID } from "node:crypto";
import { musicCatalog } from "../../../shared/content.js";
import type { MusicHistoryItem, MusicRecommendation, MusicSnapshot, MusicTrack } from "../../../shared/types.js";
import { readStore, writeStore } from "../store.js";

const cycleStartedAt = Date.now();
const trackGapMs = 8_000;
const maxRecentTracks = 5;

function getCycleWindow(date = new Date()) {
  const totalDuration = musicCatalog.reduce((sum, track) => sum + track.durationMs + trackGapMs, 0);
  const elapsed = (date.getTime() - cycleStartedAt) % totalDuration;

  let cursor = 0;
  for (let index = 0; index < musicCatalog.length; index += 1) {
    const track = musicCatalog[index];
    const trackStart = cursor;
    const trackEnd = cursor + track.durationMs;

    if (elapsed >= trackStart && elapsed < trackEnd) {
      return {
        index,
        progressMs: elapsed - trackStart,
      };
    }

    cursor = trackEnd + trackGapMs;
  }

  return {
    index: 0,
    progressMs: 0,
  };
}

function getRecentHistory(date = new Date()): MusicHistoryItem[] {
  const { index, progressMs } = getCycleWindow(date);
  let playedAtCursor = new Date(date.getTime() - progressMs);

  return Array.from({ length: Math.min(maxRecentTracks, musicCatalog.length) }, (_, offset) => {
    const catalogIndex = (index - offset + musicCatalog.length) % musicCatalog.length;
    const track = musicCatalog[catalogIndex];
    const playedAt = playedAtCursor.toISOString();
    const previousTrackIndex = (catalogIndex - 1 + musicCatalog.length) % musicCatalog.length;
    playedAtCursor = new Date(playedAtCursor.getTime() - trackGapMs - musicCatalog[previousTrackIndex].durationMs);

    return {
      ...track,
      playedAt,
    };
  });
}

function sortRecommendations(recommendations: MusicRecommendation[]) {
  return [...recommendations].sort((left, right) => Date.parse(right.requestedAt) - Date.parse(left.requestedAt));
}

export async function getMusicSnapshot(date = new Date()): Promise<MusicSnapshot> {
  const store = await readStore();
  const recentTracks = getRecentHistory(date);

  return {
    lastPlayed: recentTracks[0] ?? null,
    recentTracks,
    recommendations: sortRecommendations(store.musicRecommendations).slice(0, 5),
    updatedAt: date.toISOString(),
  };
}

export function searchMusicCatalog(query: string): MusicTrack[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return musicCatalog.slice(0, 6);
  }

  return musicCatalog
    .filter((track) =>
      [track.title, track.artist, track.album].some((field) => field.toLowerCase().includes(normalized)),
    )
    .slice(0, 8);
}

export async function createMusicRecommendation(trackId: string, note: string): Promise<MusicSnapshot> {
  const track = musicCatalog.find((entry) => entry.id === trackId);
  if (!track) {
    throw new Error("Song not found in catalog.");
  }

  await writeStore((current) => ({
    ...current,
    musicRecommendations: sortRecommendations([
      {
        ...track,
        recommendationId: randomUUID(),
        note: note.trim(),
        requestedAt: new Date().toISOString(),
      },
      ...current.musicRecommendations,
    ]).slice(0, 20),
  }));

  return getMusicSnapshot();
}
