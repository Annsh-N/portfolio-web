import express from "express";
import path from "node:path";
import type { GameConfig } from "../../shared/types.js";
import { createConnectionsGame, createWordleGame, isExpired, summarizeGame } from "./services/games.js";
import { getKalshiPublicSnapshot } from "./services/kalshi.js";
import { readStore } from "./store.js";
import { connectionsSchema, wordleSchema } from "./validation.js";

const app = express();
const cwd = process.cwd();
const workspaceRoot = path.basename(cwd) === "server" ? path.resolve(cwd, "..") : cwd;
const clientDist = path.join(workspaceRoot, "client", "dist");

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.post("/api/games/wordle", async (req, res) => {
  const parsed = wordleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid payload." });
    return;
  }

  const game = await createWordleGame(parsed.data.answer);
  res.status(201).json({ game: summarizeGame(game) });
});

app.post("/api/games/connections", async (req, res) => {
  const parsed = connectionsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid payload." });
    return;
  }

  const normalizedGroups = parsed.data.groups.map((group) => ({
    ...group,
    category: group.category.trim(),
    words: group.words.map((word) => word.trim().toUpperCase()),
  }));
  const game = await createConnectionsGame(normalizedGroups);
  res.status(201).json({ game: summarizeGame(game) });
});

app.get("/api/games/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const store = await readStore();
  const game = store.games.find((entry) => entry.type === type && entry.id === id) as GameConfig | undefined;

  if (!game) {
    res.status(404).json({ message: "Game not found." });
    return;
  }

  if (isExpired(game)) {
    res.status(410).json({ message: "This link expired after seven days." });
    return;
  }

  res.json(game);
});

app.get("/api/kalshi/public", async (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=45");
  res.json(await getKalshiPublicSnapshot());
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDist));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`Portfolio server listening on http://localhost:${port}`);
});
