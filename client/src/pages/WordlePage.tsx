import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { WordleGameConfig } from "@shared/types";
import { fetchGame } from "@/lib/api";
import { formatDate } from "@/lib/format";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

type TileState = "empty" | "correct" | "present" | "absent";

function evaluateGuess(answer: string, guess: string): TileState[] {
  const states: TileState[] = Array.from({ length: 5 }, () => "absent");
  const remaining = answer.split("");
  guess.split("").forEach((letter, index) => {
    if (answer[index] === letter) {
      states[index] = "correct";
      remaining[index] = "";
    }
  });

  guess.split("").forEach((letter, index) => {
    if (states[index] === "correct") return;
    const matchIndex = remaining.indexOf(letter);
    if (matchIndex >= 0) {
      states[index] = "present";
      remaining[matchIndex] = "";
    }
  });
  return states;
}

export function WordlePage() {
  const { id = "" } = useParams();
  const [config, setConfig] = useState<WordleGameConfig | null>(null);
  const [message, setMessage] = useState("Find the hidden five-letter word.");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<TileState[][]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGame("wordle", id)
      .then((game) => setConfig(game as WordleGameConfig))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load this game."));
  }, [id]);

  const boardRows = useMemo(() => {
    const rows = guesses.map((guess, index) => ({
      letters: guess.split(""),
      states: statuses[index],
    }));

    if (rows.length < 6) {
      rows.push({
        letters: currentGuess.padEnd(5).split(""),
        states: Array.from({ length: 5 }, () => "empty" as TileState),
      });
    }
    while (rows.length < 6) {
      rows.push({
        letters: Array.from({ length: 5 }, () => ""),
        states: Array.from({ length: 5 }, () => "empty" as TileState),
      });
    }
    return rows;
  }, [currentGuess, guesses, statuses]);

  function pushLetter(letter: string) {
    if (currentGuess.length >= 5 || guesses.length >= 6) return;
    setCurrentGuess((value) => `${value}${letter}`);
  }

  function submitGuess() {
    if (!config) return;
    if (currentGuess.length !== 5) {
      setMessage("Each guess must be five letters.");
      return;
    }
    const guess = currentGuess.toUpperCase();
    const nextStatus = evaluateGuess(config.answer, guess);
    setGuesses((value) => [...value, guess]);
    setStatuses((value) => [...value, nextStatus]);
    setCurrentGuess("");

    if (guess === config.answer) {
      setMessage("Solved. Share another one.");
      return;
    }
    if (guesses.length === 5) {
      setMessage(`No turns left. The answer was ${config.answer}.`);
      return;
    }
    setMessage("Locked in. Keep going.");
  }

  function deleteLetter() {
    setCurrentGuess((value) => value.slice(0, -1));
  }

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!config || guesses.length >= 6) return;
    const key = event.key.toUpperCase();
    if (key === "ENTER") {
      submitGuess();
      return;
    }
    if (key === "BACKSPACE") {
      deleteLetter();
      return;
    }
    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      pushLetter(key);
    }
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      handleKeyDown(event);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
          <h1>Loading custom Wordle...</h1>
        </article>
      </div>
    );
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="game-shell" initial={{ opacity: 0, y: 16 }}>
      <article className="panel game-header-card">
        <div>
          <span className="eyebrow">Custom Wordle</span>
          <h1>Find the five-letter answer.</h1>
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

      <article className="panel wordle-shell">
        <div className="wordle-board">
          {boardRows.map((row, rowIndex) =>
            row.letters.map((letter, cellIndex) => (
              <div className={`wordle-tile is-${row.states[cellIndex]}`} key={`${rowIndex}-${cellIndex}`}>
                {letter}
              </div>
            )),
          )}
        </div>

        <div className="wordle-keyboard">
          {keyboardRows.map((row) => (
            <div className="wordle-keyboard-row" key={row.join("")}>
              {row.map((key) => (
                <button
                  className={`wordle-key ${key.length > 1 ? "is-wide" : ""}`}
                  key={key}
                  onClick={() => {
                    if (key === "ENTER") submitGuess();
                    else if (key === "DEL") deleteLetter();
                    else pushLetter(key);
                  }}
                  type="button"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </article>
    </motion.div>
  );
}
