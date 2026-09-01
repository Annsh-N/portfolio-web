import { Link } from "react-router-dom";

export function CreatePage() {
  return (
    <div className="notebook-page play-page">
      <header className="page-header">
        <p className="kicker">small tools / made mostly for the delight of it</p>
        <h1>fun</h1>
        <p>
          Not every program needs to justify itself with scale. These are compact, shareable experiments that live
          beside the more serious work.
        </p>
      </header>

      <div className="play-grid">
        <Link className="play-card" to="/create/wordle">
          <span className="play-card-label">01 / wordle maker</span>
          <div className="mini-wordle" aria-hidden="true">
            {"TRACE".split("").map((letter, index) => (
              <span className={index === 0 || index === 4 ? "is-hit" : index === 2 ? "is-near" : ""} key={letter}>
                {letter}
              </span>
            ))}
          </div>
          <h2>Hide a five-letter word.</h2>
          <p>Create a custom board, get a seven-day link, and send it to someone.</p>
          <span className="text-link">open maker →</span>
        </Link>

        <Link className="play-card" to="/create/connections">
          <span className="play-card-label">02 / connections maker</span>
          <div className="mini-connections" aria-hidden="true">
            <span>RUST</span>
            <span>QUEUE</span>
            <span>CACHE</span>
            <span>TRACE</span>
          </div>
          <h2>Build four devious groups.</h2>
          <p>Write sixteen clues, publish the board, and see whether the grouping survives contact with a friend.</p>
          <span className="text-link">open maker →</span>
        </Link>

        <Link className="play-card kalshi-card" to="/lab/kalshi">
          <span className="play-card-label">03 / public telemetry</span>
          <div className="telemetry-line" aria-hidden="true">
            <span />
          </div>
          <h2>Kalshi bot dashboard.</h2>
          <p>A deliberately delayed, read-only view of bot health and aggregate behavior—without operational state.</p>
          <span className="text-link">open telemetry →</span>
        </Link>
      </div>
    </div>
  );
}
