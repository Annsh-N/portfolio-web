import crypto from "node:crypto";
import { writeStore } from "../store.js";
import type {
  ConnectionsGameConfig,
  ConnectionsGroup,
  GameConfig,
  GameSummary,
  WordleGameConfig,
} from "../../../shared/types.js";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function gamePath(game: GameConfig): string {
  return game.type === "wordle" ? `/play/wordle/${game.id}` : `/play/connections/${game.id}`;
}

export function summarizeGame(game: GameConfig): GameSummary {
  return {
    id: game.id,
    type: game.type,
    createdAt: game.createdAt,
    expiresAt: game.expiresAt,
    path: gamePath(game),
  };
}

function createGameId(): string {
  return crypto.randomBytes(5).toString("base64url").toLowerCase();
}

export function isExpired(game: GameConfig): boolean {
  return new Date(game.expiresAt).getTime() <= Date.now();
}

export async function createWordleGame(answer: string): Promise<WordleGameConfig> {
  const createdAt = new Date().toISOString();
  const game: WordleGameConfig = {
    type: "wordle",
    id: createGameId(),
    answer: answer.toUpperCase(),
    createdAt,
    expiresAt: new Date(Date.now() + ONE_WEEK_MS).toISOString(),
    createdBy: "portfolio-create-page",
  };

  await writeStore((current) => ({
    ...current,
    games: [...current.games.filter((entry) => !isExpired(entry)), game],
  }));

  return game;
}

export async function createConnectionsGame(groups: ConnectionsGroup[]): Promise<ConnectionsGameConfig> {
  const createdAt = new Date().toISOString();
  const game: ConnectionsGameConfig = {
    type: "connections",
    id: createGameId(),
    createdAt,
    expiresAt: new Date(Date.now() + ONE_WEEK_MS).toISOString(),
    createdBy: "portfolio-create-page",
    groups,
  };

  await writeStore((current) => ({
    ...current,
    games: [...current.games.filter((entry) => !isExpired(entry)), game],
  }));

  return game;
}
