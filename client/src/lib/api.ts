import type {
  ConnectionsGroup,
  GameConfig,
  GameCreateResult,
  KalshiPublicSnapshot,
} from "@shared/types";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function createWordle(answer: string): Promise<GameCreateResult> {
  return request<GameCreateResult>("/api/games/wordle", {
    method: "POST",
    body: JSON.stringify({ answer }),
  });
}

export function createConnections(groups: ConnectionsGroup[]): Promise<GameCreateResult> {
  return request<GameCreateResult>("/api/games/connections", {
    method: "POST",
    body: JSON.stringify({ groups }),
  });
}

export function fetchGame(type: "wordle" | "connections", id: string): Promise<GameConfig> {
  return request<GameConfig>(`/api/games/${type}/${id}`);
}

export function fetchKalshiPublicSnapshot(): Promise<KalshiPublicSnapshot> {
  return request<KalshiPublicSnapshot>("/api/kalshi/public");
}
