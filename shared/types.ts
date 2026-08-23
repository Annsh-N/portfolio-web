export type ConnectionsGroup = {
  category: string;
  color: "amber" | "green" | "blue" | "purple";
  words: string[];
};

export type WordleGameConfig = {
  type: "wordle";
  id: string;
  answer: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
};

export type ConnectionsGameConfig = {
  type: "connections";
  id: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  groups: ConnectionsGroup[];
};

export type GameConfig = WordleGameConfig | ConnectionsGameConfig;

export type GameSummary = {
  id: string;
  type: GameConfig["type"];
  createdAt: string;
  expiresAt: string;
  path: string;
};

export type GameCreateResult = {
  game: GameSummary;
};

export type KalshiPublicSnapshot = {
  status: "offline" | "paper" | "live";
  updatedAt: string | null;
  uptimeSeconds: number | null;
  trackedMarkets: number | null;
  decisionsToday: number | null;
  fillsToday: number | null;
  marketDataAgeMs: number | null;
  note: string;
};
