import { Check, Copy, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createWordle } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { wordleDictionarySet } from "@shared/wordleDictionary";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["CREATE", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

type CreateResultState = {
  path: string;
  expiresAt: string;
};

const defaultWord = "ANNSH";

export function CreateWordlePage() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResultState | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => (typeof window === "undefined" || !result ? "" : `${window.location.origin}${result.path}`),
    [result],
  );

  const activeWord = (word.trim() || defaultWord).slice(0, 5).toUpperCase();
  const displayWord = activeWord.split("");

  function pushLetter(letter: string) {
    setWord((current) => (current.length >= 5 ? current : `${current}${letter}`));
  }

  function deleteLetter() {
    setWord((current) => current.slice(0, -1));
  }

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const key = event.key.toUpperCase();
    if (key === "ENTER") {
      handleCreate();
      return;
    }
    if (key === "BACKSPACE" || key === "DELETE") {
      deleteLetter();
      return;
    }
    if (/^[A-Z]$/.test(key)) {
      pushLetter(key);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleCreate() {
    if (loading) {
      return;
    }

    setError(null);

    const nextWord = word.trim() || defaultWord;

    if (nextWord.length !== 5) {
      setError("Word must be five letters.");
      return;
    }

    if (!wordleDictionarySet.has(nextWord.toUpperCase())) {
      setError("Use a real five-letter word.");
      return;
    }

    setLoading(true);
    try {
      const response = await createWordle(nextWord);
      setResult({ path: response.game.path, expiresAt: response.game.expiresAt });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate Wordle.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="wordle-nyt-page" initial={{ opacity: 0, y: 16 }}>
      <div className="wordle-nyt-shell wordle-maker-shell">
        <header className="wordle-nyt-header">
          <Link className="wordle-nyt-site-link" to="/">
            Annsh Navle
          </Link>
          <h1 className="wordle-nyt-title">WORDLE</h1>
          <div className="wordle-nyt-header-meta">
            <Link className="wordle-nyt-create-link is-header" to="/create">
              Puzzle Lab
            </Link>
          </div>
        </header>

        <div className="wordle-nyt-status" role="status">
          {error ?? (result ? "Link ready to send." : "Pick a five-letter answer and create a custom board.")}
        </div>

        <div className="wordle-maker-result-strip">
          {result ? (
            <>
              <a className="wordle-maker-url" href={shareUrl}>
                {shareUrl}
              </a>
              <div className="wordle-maker-result-meta">
                <span>Expires {formatDate(result.expiresAt)}</span>
                <button className="wordle-maker-copy" onClick={handleCopy} type="button">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </>
          ) : (
            <span className="wordle-maker-hint">The link appears here after you create it.</span>
          )}
        </div>

        <div className="wordle-nyt-board-container">
          <div className="wordle-nyt-board wordle-maker-board">
            {displayWord.map((letter, index) => (
              <div className={`wordle-nyt-tile ${letter ? "is-filled" : ""} ${!word.trim() ? "is-default" : ""}`} key={index}>
                {letter}
              </div>
            ))}
          </div>
        </div>

        <div className="wordle-nyt-keyboard">
          {keyboardRows.map((row, rowIndex) => (
            <div className="wordle-nyt-keyboard-row" key={row.join("")}>
              {rowIndex === 1 ? <div className="wordle-nyt-spacer-half" /> : null}
              {row.map((key) => (
                <button
                  className={`wordle-nyt-key ${key.length > 1 ? "is-wide" : ""} ${
                    key === "CREATE" ? "is-maker-action" : ""
                  }`}
                  key={key}
                  onClick={() => {
                    if (key === "CREATE") handleCreate();
                    else if (key === "DEL") deleteLetter();
                    else pushLetter(key);
                  }}
                  type="button"
                >
                  {loading && key === "CREATE" ? <RefreshCcw className="spin" size={16} /> : key}
                </button>
              ))}
              {rowIndex === 1 ? <div className="wordle-nyt-spacer-half" /> : null}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
