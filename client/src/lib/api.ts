import type {
  BootstrapPayload,
  ConnectionsGroup,
  GameConfig,
  GameCreateResult,
  PresencePayload,
  SkillState,
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

export function fetchBootstrap(): Promise<BootstrapPayload> {
  return request<BootstrapPayload>("/api/bootstrap");
}

export function fetchPresence(): Promise<PresencePayload> {
  return request<PresencePayload>("/api/presence");
}

export function fetchSkillState(): Promise<SkillState> {
  return request<SkillState>("/api/skills");
}

export function growSkill(id: string): Promise<SkillState> {
  return request<SkillState>("/api/skills/grow", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
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
