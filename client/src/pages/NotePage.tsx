import { Link, useParams } from "react-router-dom";
import { getNote } from "@/content/siteContent";

export function NotePage() {
  const { slug = "" } = useParams();
  const note = getNote(slug);

  if (!note) {
    return (
      <div className="notebook-page empty-page">
        <p className="kicker">404 / missing article</p>
        <h1>This article does not exist.</h1>
        <Link className="text-link" to="/writing">
          return to articles →
        </Link>
      </div>
    );
  }

  return (
    <article className="notebook-page article-essay">
      <Link className="back-link" to="/writing">
        ← all articles
      </Link>
      <header>
        <p className="kicker">article</p>
        <h1>{note.title}</h1>
        <p className="article-summary">{note.summary}</p>
        <div className="article-byline">
          <span>By Annsh Navle</span>
          <span>{note.date}</span>
          <span>{note.readTime} read</span>
        </div>
      </header>
      <div className="article-copy">
        {note.paragraphs.map((paragraph, index) => (
          <p className={index === 0 ? "article-opening" : ""} key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className="article-end">∎</div>
    </article>
  );
}
