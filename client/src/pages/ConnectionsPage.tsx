import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ConnectionsGameConfig, ConnectionsGroup } from "@shared/types";
import { fetchGame } from "@/lib/api";
import { formatDate } from "@/lib/format";

const colorMap = {
  amber: "amber",
  green: "green",
  blue: "blue",
  purple: "purple",
} as const;

function shuffle<T>(array: T[]): T[] {
  const next = [...array];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    [next[index], next[random]] = [next[random], next[index]];
  }
  return next;
}

export function ConnectionsPage() {
  const { id = "" } = useParams();
  const [config, setConfig] = useState<ConnectionsGameConfig | null>(null);
  const [pool, setPool] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionsGroup[]>([]);
  const [mistakes, setMistakes] = useState(4);
  const [message, setMessage] = useState("Create four groups of four.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGame("connections", id)
      .then((game) => {
        const parsed = game as ConnectionsGameConfig;
        setConfig(parsed);
        setPool(shuffle(parsed.groups.flatMap((group) => group.words)));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load this game."));
  }, [id]);

  const remaining = useMemo(() => pool.filter((word) => !solved.some((group) => group.words.includes(word))), [pool, solved]);

  function toggleWord(word: string) {
    setSelected((current) => {
      if (current.includes(word)) {
        return current.filter((entry) => entry !== word);
      }
      if (current.length === 4) {
        return current;
      }
      return [...current, word];
    });
  }

  function submitSelection() {
    if (!config) return;
    if (selected.length !== 4) {
      setMessage("Choose exactly four words.");
      return;
    }
    const match = config.groups.find((group) => selected.every((word) => group.words.includes(word)));
    if (!match) {
      setMistakes((value) => Math.max(0, value - 1));
      setMessage("Not quite. The board rejects that grouping.");
      setSelected([]);
      return;
    }
    setSolved((current) => [...current, match]);
    setPool((current) => current.filter((word) => !match.words.includes(word)));
    setSelected([]);
    setMessage(solved.length === 3 ? "Solved. Board complete." : "Group found.");
  }

  if (error) {
    return (
      <div className="game-shell">
        <article className="panel game-error-card">
          <AlertTriangle size={22} />
          <h1>{error}</h1>
          <Link className="secondary-button" to="/create">
            <ArrowLeft size={16} />
            Back to create
          </Link>
        </article>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="game-shell">
        <article className="panel game-error-card">
          <RefreshCcw className="spin" size={22} />
          <h1>Loading Connections board...</h1>
        </article>
      </div>
    );
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="game-shell" initial={{ opacity: 0, y: 16 }}>
      <article className="panel game-header-card">
        <div>
          <span className="eyebrow">Custom Connections</span>
          <h1>Create four groups of four.</h1>
          <p>{message}</p>
        </div>
        <div className="game-meta">
          <span>Expires {formatDate(config.expiresAt)}</span>
          <Link className="secondary-button" to="/create">
            <ArrowLeft size={16} />
            New game
          </Link>
        </div>
      </article>

      <article className="panel connections-shell">
        <div className="connections-solved">
          {solved.map((group) => (
            <div className={`connections-category is-${colorMap[group.color]}`} key={group.category}>
              <strong>{group.category}</strong>
              <small>{group.words.join(", ")}</small>
            </div>
          ))}
        </div>

        <div className="connections-grid">
          {remaining.map((word) => (
            <button
              className={`connections-tile ${selected.includes(word) ? "is-selected" : ""}`}
              key={word}
              onClick={() => toggleWord(word)}
              type="button"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="connections-controls">
          <span>Mistakes remaining: {"•".repeat(mistakes)}</span>
          <div>
            <button className="secondary-button" onClick={() => setPool((current) => shuffle(current))} type="button">
              Shuffle
            </button>
            <button className="secondary-button" onClick={() => setSelected([])} type="button">
              Deselect all
            </button>
            <button className="primary-button" onClick={submitSelection} type="button">
              Submit
            </button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
