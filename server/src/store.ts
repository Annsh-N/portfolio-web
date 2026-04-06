import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { initialSkills } from "../../shared/content.js";
import type { GameConfig, SkillState } from "../../shared/types.js";

type StoreShape = {
  skills: SkillState;
  games: GameConfig[];
};

const cwd = process.cwd();
const serverRoot = path.basename(cwd) === "server" ? cwd : path.resolve(cwd, "server");
const dataDir = path.join(serverRoot, "data");
const storePath = path.join(dataDir, "store.json");
const MAX_SKILL_SIZE_RATIO = 5;

const seedStore: StoreShape = {
  skills: {
    bubbles: initialSkills,
    updatedAt: new Date().toISOString(),
  },
  games: [],
};

let writeChain = Promise.resolve();

function normalizeSkillState(skills: SkillState | undefined): SkillState {
  const persisted = new Map((skills?.bubbles ?? []).map((bubble) => [bubble.id, bubble]));

  const bubbles = initialSkills.map((template) => {
    const saved = persisted.get(template.id);
    const canReuseSavedValues = typeof saved?.category === "string";
    const size = canReuseSavedValues && typeof saved?.size === "number" ? saved.size : template.size;
    const baseSize = canReuseSavedValues && typeof saved?.baseSize === "number" ? saved.baseSize : template.baseSize;
    const weight = canReuseSavedValues && typeof saved?.weight === "number" ? saved.weight : template.weight;

    return {
      ...template,
      size: Number(size.toFixed(3)),
      baseSize: Number(baseSize.toFixed(3)),
      weight: Number(weight.toFixed(3)),
    };
  });

  const smallest = Math.max(0.001, Math.min(...bubbles.map((bubble) => bubble.size)));
  const maxAllowed = smallest * MAX_SKILL_SIZE_RATIO;

  return {
    bubbles: bubbles.map((bubble) => ({
      ...bubble,
      size: Number(Math.min(Math.max(bubble.size, 0.001), maxAllowed).toFixed(3)),
    })),
    updatedAt: skills?.updatedAt ?? new Date().toISOString(),
  };
}

async function ensureStore(): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(seedStore, null, 2), "utf8");
  }
}

export async function readStore(): Promise<StoreShape> {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  const parsed = JSON.parse(raw) as StoreShape;
  return {
    skills: normalizeSkillState(parsed.skills),
    games: Array.isArray(parsed.games) ? parsed.games : [],
  };
}

export async function writeStore(updater: (current: StoreShape) => StoreShape | Promise<StoreShape>): Promise<StoreShape> {
  writeChain = writeChain.then(async () => {
    const current = await readStore();
    const next = await updater(current);
    await writeFile(storePath, JSON.stringify(next, null, 2), "utf8");
  });

  await writeChain;
  return readStore();
}
