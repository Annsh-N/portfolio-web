import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { WordleGameConfig } from "@shared/types";
import { wordleDictionarySet } from "@shared/wordleDictionary";
import { fetchGame } from "@/lib/api";
import { formatDate } from "@/lib/format";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

type TileState = "empty" | "correct" | "present" | "absent";

type KeyState = Exclude<TileState, "empty">;

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
  const [showResultModal, setShowResultModal] = useState(false);

  const isSolved = !!config && guesses.includes(config.answer);
  const isComplete = isSolved || guesses.length >= 6;
  const endState = isSolved ? "win" : guesses.length >= 6 ? "loss" : null;

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
    if (currentGuess.length >= 5 || isComplete) return;
    setCurrentGuess((value) => `${value}${letter}`);
  }

  function submitGuess() {
    if (!config || isComplete) return;
    if (currentGuess.length !== 5) {
      setMessage("Each guess must be five letters.");
      return;
    }
    const guess = currentGuess.toUpperCase();
    if (!wordleDictionarySet.has(guess)) {
      setMessage("That word is not in the dictionary.");
      return;
    }
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
    if (!config || isComplete) return;
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

  useEffect(() => {
    if (endState) {
      setShowResultModal(true);
    }
  }, [endState]);

  const keyStates = useMemo(() => {
    const priority: Record<KeyState, number> = {
      absent: 1,
      present: 2,
      correct: 3,
    };

    return guesses.reduce<Record<string, KeyState>>((accumulator, guess, guessIndex) => {
      guess.split("").forEach((letter, letterIndex) => {
        const nextState = statuses[guessIndex]?.[letterIndex];
        if (!nextState || nextState === "empty") {
          return;
        }
        const currentState = accumulator[letter];
        if (!currentState || priority[nextState] > priority[currentState]) {
          accumulator[letter] = nextState;
        }
      });
      return accumulator;
    }, {});
  }, [guesses, statuses]);

  if (error) {
    return (
      <div className="wordle-nyt-page">
        <article className="wordle-nyt-error">
          <AlertTriangle size={22} />
          <h1>{error}</h1>
          <Link className="wordle-nyt-action" to="/create/wordle">
            <ArrowLeft size={16} />
            Back to create
          </Link>
        </article>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="wordle-nyt-page">
        <article className="wordle-nyt-error">
          <RefreshCcw className="spin" size={22} />
          <h1>Loading custom Wordle...</h1>
        </article>
      </div>
    );
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="wordle-nyt-page" initial={{ opacity: 0, y: 16 }}>
      <div className="wordle-nyt-shell">
        <header className="wordle-nyt-header">
          <Link className="wordle-nyt-site-link" to="/">
            Annsh Navle
          </Link>
          <h1 className="wordle-nyt-title">WORDLE</h1>
          <div className="wordle-nyt-header-meta">
            <span>{formatDate(config.createdAt)}</span>
          </div>
        </header>

        <div className="wordle-nyt-status" role="status">
          {message}
        </div>

        <div className="wordle-nyt-subnav">
          <Link className="wordle-nyt-create-link" to="/create/wordle">
            Make your own
          </Link>
        </div>

        <div className="wordle-nyt-board-container">
          <div className="wordle-nyt-board">
          {boardRows.map((row, rowIndex) =>
            row.letters.map((letter, cellIndex) => (
              <div className={`wordle-nyt-tile is-${row.states[cellIndex]}`} key={`${rowIndex}-${cellIndex}`}>
                {letter}
              </div>
            )),
          )}
        </div>
        </div>

        <div className="wordle-nyt-keyboard">
          {keyboardRows.map((row, rowIndex) => (
            <div className="wordle-nyt-keyboard-row" key={row.join("")}>
              {rowIndex === 1 ? <div className="wordle-nyt-spacer-half" /> : null}
              {row.map((key) => (
                <button
                  className={`wordle-nyt-key ${key.length > 1 ? "is-wide" : ""} ${
                    keyStates[key] ? `is-${keyStates[key]}` : ""
                  }`}
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
              {rowIndex === 1 ? <div className="wordle-nyt-spacer-half" /> : null}
            </div>
          ))}
        </div>

        {showResultModal && endState ? (
          <div className="wordle-result-modal-backdrop">
            <div className="wordle-result-modal">
              <span className="eyebrow">{endState === "win" ? "You got it" : "Out of turns"}</span>
              <h2>{endState === "win" ? "Nice solve." : "Good try."}</h2>
              <p>
                {endState === "win"
                  ? `You cracked ${config.answer} in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`
                  : `The answer was ${config.answer}.`}
              </p>
              <div className="wordle-result-actions">
                <Link className="wordle-result-link" to="/create/wordle">
                  Make your own
                </Link>
                <button className="wordle-result-dismiss" onClick={() => setShowResultModal(false)} type="button">
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
