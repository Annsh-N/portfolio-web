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

const seedStore: StoreShape = {
  skills: {
    bubbles: initialSkills,
    updatedAt: new Date().toISOString(),
  },
  games: [],
};

let writeChain = Promise.resolve();

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
    skills: parsed.skills ?? seedStore.skills,
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
