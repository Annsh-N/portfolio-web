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
  const [shakingWords, setShakingWords] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);

  const endState = solved.length === 4 ? "win" : mistakes === 0 ? "loss" : null;

  useEffect(() => {
    fetchGame("connections", id)
      .then((game) => {
        const parsed = game as ConnectionsGameConfig;
        setConfig(parsed);
        setPool(shuffle(parsed.groups.flatMap((group) => group.words)));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load this game."));
  }, [id]);

  useEffect(() => {
    if (endState) {
      setShowResultModal(true);
    }
  }, [endState]);

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
      setShakingWords(selected);
      window.setTimeout(() => setShakingWords([]), 420);
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
      <div className="connections-nyt-page">
        <article className="connections-nyt-error">
          <AlertTriangle size={22} />
          <h1>{error}</h1>
          <Link className="connections-nyt-action" to="/create/connections">
            <ArrowLeft size={16} />
            Back to create
          </Link>
        </article>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="connections-nyt-page">
        <article className="connections-nyt-error">
          <RefreshCcw className="spin" size={22} />
          <h1>Loading Connections board...</h1>
        </article>
      </div>
    );
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="connections-nyt-page" initial={{ opacity: 0, y: 16 }}>
      <div className="connections-nyt-shell">
        <div className="connections-nyt-topbar">
          <Link className="connections-nyt-site-link" to="/">
            Annsh Navle
          </Link>
          <div className="connections-nyt-topbar-actions">
            <span>{formatDate(config.createdAt)}</span>
            <Link className="connections-nyt-create-link" to="/create/connections">
              Make your own
            </Link>
          </div>
        </div>

        <h1 className="connections-nyt-title">Create four groups of four!</h1>
        <p className="connections-nyt-message">{message}</p>

        <div className="connections-nyt-categories">
          {solved.map((group) => (
            <div className={`connections-nyt-category is-${colorMap[group.color]}`} key={group.category}>
              <div>
                <strong>{group.category}</strong>
                <small>{group.words.join(", ")}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="connections-nyt-grid">
          {remaining.map((word) => (
            <button
              className={`connections-nyt-word ${selected.includes(word) ? "is-selected" : ""} ${
                shakingWords.includes(word) ? "is-shaking" : ""
              }`}
              key={word}
              onClick={() => toggleWord(word)}
              type="button"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="connections-nyt-controls">
          <div className="connections-nyt-button-row">
            <button className="connections-nyt-button" onClick={() => setPool((current) => shuffle(current))} type="button">
              Shuffle
            </button>
            <button className="connections-nyt-button" onClick={() => setSelected([])} type="button">
              Deselect all
            </button>
            <button className="connections-nyt-button is-primary" onClick={submitSelection} type="button">
              Submit
            </button>
          </div>
          <div className="connections-nyt-mistakes">
            Mistakes remaining: <span>{"•".repeat(mistakes)}</span>
          </div>
        </div>

        {showResultModal && endState ? (
          <div className="connections-result-modal-backdrop">
            <div className="connections-result-modal">
              <span className="eyebrow">{endState === "win" ? "Board cleared" : "Out of mistakes"}</span>
              <h2>{endState === "win" ? "Nice solve." : "Close, but not quite."}</h2>
              <p>
                {endState === "win"
                  ? "You found all four categories."
                  : "The board locked before all four groups were found."}
              </p>
              <div className="connections-result-actions">
                <Link className="connections-result-link" to="/create/connections">
                  Make your own
                </Link>
                <button
                  className="connections-result-dismiss"
                  onClick={() => setShowResultModal(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
