import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CreatePage() {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="create-hub-page" initial={{ opacity: 0, y: 20 }}>
      <div className="create-hub-shell">
        <span className="eyebrow">Puzzle Lab</span>
        <h1>Pick a puzzle.</h1>
        <p>Choose a format, drop in your twist, and get a shareable link without leaving the site flow.</p>

        <div className="create-hub-grid">
          <Link className="create-hub-card is-wordle" to="/create/wordle">
            <div>
              <span className="eyebrow">Wordle</span>
              <h2>Five letters. One clean reveal.</h2>
              <p>Make a custom Wordle in a page that feels like the game itself.</p>
            </div>
            <span className="create-hub-link">
              Open maker
              <ArrowRight size={16} />
            </span>
          </Link>

          <Link className="create-hub-card is-connections" to="/create/connections">
            <div>
              <span className="eyebrow">Connections</span>
              <h2>Four groups. Sixteen little traps.</h2>
              <p>Build a board, then share the link once the categories feel right.</p>
            </div>
            <span className="create-hub-link">
              Open maker
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
