import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ConnectionsGroup } from "@shared/types";
import { createConnections } from "@/lib/api";
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

export function CreateConnectionsPage() {
  const [groups, setGroups] = useState<ConnectionsGroup[]>(defaultGroups);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResultState | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(
    () => (typeof window === "undefined" || !result ? "" : `${window.location.origin}${result.path}`),
    [result],
  );

  const previewWords = useMemo(() => groups.flatMap((group) => group.words), [groups]);

  async function handleCreate() {
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await createConnections(groups);
      setResult({ path: response.game.path, expiresAt: response.game.expiresAt });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate Connections.");
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
    <motion.div animate={{ opacity: 1, y: 0 }} className="connections-nyt-page" initial={{ opacity: 0, y: 16 }}>
      <div className="connections-nyt-shell connections-maker-shell">
        <div className="connections-nyt-topbar">
          <Link className="connections-nyt-site-link" to="/">
            Annsh Navle
          </Link>
          <div className="connections-nyt-topbar-actions">
            <Link className="connections-nyt-create-link" to="/create">
              Puzzle Lab
            </Link>
          </div>
        </div>

        <h1 className="connections-nyt-title">Build a board.</h1>
        <p className="connections-nyt-message">
          {error ?? (result ? "Link ready to share." : "Name four categories, fill sixteen words, then publish it.")}
        </p>

        <div className="connections-maker-result-strip">
          {result ? (
            <>
              <a className="connections-maker-url" href={shareUrl}>
                {shareUrl}
              </a>
              <div className="connections-maker-result-meta">
                <span>Expires {formatDate(result.expiresAt)}</span>
                <button className="connections-maker-copy" onClick={handleCopy} type="button">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </>
          ) : (
            <span className="connections-maker-hint">The share link appears here after publish.</span>
          )}
        </div>

        <div className="connections-maker-builder">
          {groups.map((group, groupIndex) => (
            <section className={`connections-maker-group is-${group.color}`} key={group.color}>
              <input
                className="connections-maker-category-input"
                onChange={(event) =>
                  setGroups((current) =>
                    current.map((item, index) =>
                      index === groupIndex ? { ...item, category: event.target.value.toUpperCase() } : item,
                    ),
                  )
                }
                placeholder="CATEGORY"
                type="text"
                value={group.category}
              />
              <div className="connections-maker-word-grid">
                {group.words.map((word, wordIndex) => (
                  <input
                    className="connections-maker-word-input"
                    key={`${group.color}-${wordIndex}`}
                    onChange={(event) =>
                      setGroups((current) =>
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
                    placeholder={`ITEM ${wordIndex + 1}`}
                    type="text"
                    value={word}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="connections-nyt-grid connections-maker-preview">
          {previewWords.map((word, index) => (
            <div className="connections-nyt-word" key={index}>
              {word || `WORD ${index + 1}`}
            </div>
          ))}
        </div>

        <div className="connections-nyt-controls">
          <div className="connections-nyt-button-row">
            <button className="connections-nyt-button is-primary" onClick={handleCreate} type="button">
              {loading ? "Publishing..." : "Publish board"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
