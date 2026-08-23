import { Link } from "react-router-dom";
import { notes } from "@/content/siteContent";

export function WritingPage() {
  return (
    <div className="notebook-page">
      <header className="page-header">
        <p className="kicker">article archive / built, measured, written down</p>
        <h1>Articles</h1>
        <p>
          Things I write after building or measuring something. The goal is to make the useful detail visible, not
          to pretend a project taught me more than it did.
        </p>
      </header>

      <div className="writing-index">
        {notes.map((note, index) => (
          <Link className="writing-entry" key={note.slug} to={`/writing/${note.slug}`}>
            <span className="writing-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <div className="writing-meta">
                <time>{note.date}</time>
                <span>{note.readTime}</span>
              </div>
              <h2>{note.title}</h2>
              <p>{note.summary}</p>
            </div>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
