import { Check, Copy, Link2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { createConnections, createWordle } from "@/lib/api";
import type { ConnectionsGroup } from "@shared/types";
import { formatDate } from "@/lib/format";

const defaultGroups: ConnectionsGroup[] = [
  { category: "", color: "amber", words: ["", "", "", ""] },
  { category: "", color: "green", words: ["", "", "", ""] },
  { category: "", color: "blue", words: ["", "", "", ""] },
  { category: "", color: "purple", words: ["", "", "", ""] },
];

type CreateResultState = {
  path: string;
  expiresAt: string;
};

export function CreatePage() {
  const [wordleWord, setWordleWord] = useState("");
  const [connectionsGroups, setConnectionsGroups] = useState<ConnectionsGroup[]>(defaultGroups);
  const [loadingKind, setLoadingKind] = useState<"wordle" | "connections" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResultState | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(
    () => (typeof window === "undefined" || !result ? "" : `${window.location.origin}${result.path}`),
    [result],
  );

  async function handleWordleCreate(event: FormEvent) {
    event.preventDefault();
    setLoadingKind("wordle");
    setError(null);
    try {
      const response = await createWordle(wordleWord.trim());
      setResult({ path: response.game.path, expiresAt: response.game.expiresAt });
      setWordleWord("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate Wordle.");
    } finally {
      setLoadingKind(null);
    }
  }

  async function handleConnectionsCreate(event: FormEvent) {
    event.preventDefault();
    setLoadingKind("connections");
    setError(null);
    try {
      const response = await createConnections(connectionsGroups);
      setResult({ path: response.game.path, expiresAt: response.game.expiresAt });
      setConnectionsGroups(defaultGroups);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate Connections.");
    } finally {
      setLoadingKind(null);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="page-shell create-shell" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.45 }}>
      <section className="create-hero panel">
        <span className="eyebrow">Create Page</span>
        <h1>Generate custom games that feel like shipped product, not toy demos.</h1>
        <p>
          This MVP stores configs server-side, generates real shareable links under this host, and expires them
          automatically after seven days.
        </p>
      </section>

      <section className="create-grid">
        <form className="panel create-card" onSubmit={handleWordleCreate}>
          <div className="create-card-heading">
            <div>
              <span className="eyebrow">Custom Wordle</span>
              <h2>Five letters, clean loop, portable link.</h2>
            </div>
            <Sparkles size={18} />
          </div>

          <label>
            Secret answer
            <input
              maxLength={5}
              onChange={(event) => setWordleWord(event.target.value.toUpperCase())}
              placeholder="FLINT"
              type="text"
              value={wordleWord}
            />
          </label>

          <p className="field-note">
            The created route renders a real playable board with the same structural gameplay pattern as the
            reference implementation.
          </p>

          <button className="primary-button" disabled={loadingKind === "wordle"} type="submit">
            {loadingKind === "wordle" ? "Generating..." : "Generate Wordle link"}
          </button>
        </form>

        <form className="panel create-card create-card-wide" onSubmit={handleConnectionsCreate}>
          <div className="create-card-heading">
            <div>
              <span className="eyebrow">Custom Connections</span>
              <h2>Define four categories and publish a playable board.</h2>
            </div>
            <Link2 size={18} />
          </div>

          <div className="connections-builder">
            {connectionsGroups.map((group, groupIndex) => (
              <div className={`builder-group builder-${group.color}`} key={group.color}>
                <input
                  onChange={(event) =>
                    setConnectionsGroups((current) =>
                      current.map((item, index) =>
                        index === groupIndex ? { ...item, category: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Category"
                  type="text"
                  value={group.category}
                />
                <div className="builder-words">
                  {group.words.map((word, wordIndex) => (
                    <input
                      key={`${group.color}-${wordIndex}`}
                      onChange={(event) =>
                        setConnectionsGroups((current) =>
                          current.map((item, index) =>
                            index === groupIndex
                              ? {
                                  ...item,
                                  words: item.words.map((value, valueIndex) =>
                                    valueIndex === wordIndex ? event.target.value.toUpperCase() : value,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      placeholder={`Item ${wordIndex + 1}`}
                      type="text"
                      value={word}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="primary-button" disabled={loadingKind === "connections"} type="submit">
            {loadingKind === "connections" ? "Publishing..." : "Generate Connections link"}
          </button>
        </form>
      </section>

      <section className="create-feedback-grid">
        <article className={`panel feedback-card ${result ? "is-success" : ""}`}>
          <span className="eyebrow">Generated Link</span>
          {result ? (
            <>
              <h3>Shareable route is live.</h3>
              <p>{shareUrl}</p>
              <div className="feedback-row">
                <span>Expires {formatDate(result.expiresAt)}</span>
                <button className="secondary-button" onClick={handleCopy} type="button">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Waiting for a game definition.</h3>
              <p>Generate a Wordle or Connections board to get a seven-day playable link hosted on this site.</p>
            </>
          )}
        </article>

        <article className="panel feedback-card">
          <span className="eyebrow">Validation + product notes</span>
          <h3>Built for later backend upgrades.</h3>
          <p>
            Storage, expiry, and route resolution already live on the server. Swapping JSON persistence for a
            database later is straightforward.
          </p>
          {error ? <div className="error-banner">{error}</div> : null}
        </article>
      </section>
    </motion.div>
  );
}
