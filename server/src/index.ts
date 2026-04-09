import express from "express";
import path from "node:path";
import { courseworkTimeline } from "../../shared/content.js";
import type { GameConfig, SkillState } from "../../shared/types.js";
import { getEducationSnapshot } from "./services/education.js";
import { createConnectionsGame, createWordleGame, isExpired, summarizeGame } from "./services/games.js";
import { getGitHubSnapshot } from "./services/github.js";
import { createMusicRecommendation, getMusicSnapshot, searchMusicCatalog } from "./services/music.js";
import { getPresencePayload, getPresenceSnapshot } from "./services/presence.js";
import { growSkill, skillsEvents } from "./services/skills.js";
import { readStore } from "./store.js";
import { connectionsSchema, musicRecommendationSchema, wordleSchema } from "./validation.js";

const app = express();
const cwd = process.cwd();
const workspaceRoot = path.basename(cwd) === "server" ? path.resolve(cwd, "..") : cwd;
const clientDist = path.join(workspaceRoot, "client", "dist");

app.use(express.json());

app.get("/api/bootstrap", async (_req, res) => {
  const [education, github, presence, music, store] = await Promise.all([
    getEducationSnapshot(),
    getGitHubSnapshot(),
    Promise.resolve(getPresenceSnapshot()),
    getMusicSnapshot(),
    readStore(),
  ]);
  res.json({
    education,
    github,
    presence,
    music,
    coursework: courseworkTimeline,
    skills: store.skills,
  });
});

app.get("/api/education", async (_req, res) => {
  const education = await getEducationSnapshot();
  res.json(education);
});

app.get("/api/github", async (_req, res) => {
  const github = await getGitHubSnapshot();
  res.json(github);
});

app.get("/api/music", async (_req, res) => {
  res.json(await getMusicSnapshot());
});

app.get("/api/music/search", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  res.json({
    query,
    results: searchMusicCatalog(query),
  });
});

app.post("/api/music/recommend", async (req, res) => {
  const parsed = musicRecommendationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid payload." });
    return;
  }

  try {
    const snapshot = await createMusicRecommendation(parsed.data.trackId, parsed.data.note);
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(404).json({ message: error instanceof Error ? error.message : "Song not found." });
  }
});

app.get("/api/presence", (_req, res) => {
  res.json(getPresencePayload());
});

app.get("/api/skills", async (_req, res) => {
  const store = await readStore();
  res.json(store.skills);
});

app.get("/stream/skills", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const store = await readStore();
  const pushUpdate = (payload: SkillState) => {
    res.write(`event: skills\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  pushUpdate(store.skills);
  skillsEvents.on("update", pushUpdate);

  req.on("close", () => {
    skillsEvents.off("update", pushUpdate);
    res.end();
  });
});

app.post("/api/skills/grow", async (req, res) => {
  const id = String(req.body?.id ?? "");
  if (!id) {
    res.status(400).json({ message: "Missing skill id." });
    return;
  }
  const next = await growSkill(id);
  res.json(next);
});

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
