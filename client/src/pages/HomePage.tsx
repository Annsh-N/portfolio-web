import { Link } from "react-router-dom";
import { experiences, notes, profile, projects } from "@/content/siteContent";

export function HomePage() {
  return (
    <div className="notebook-page home-page">
      <div className="home-opening">
        <div className="home-hero">
          <section className="home-intro" aria-labelledby="home-title">
            <h1 id="home-title">{profile.name}</h1>
            <div className="inline-links" aria-label="Profile links">
              <a href={profile.github} rel="noreferrer" target="_blank">
                github ↗
              </a>
              <a href={profile.linkedin} rel="noreferrer" target="_blank">
                linkedin ↗
              </a>
              <a href={`mailto:${profile.email}`}>email ↗</a>
            </div>
          </section>

          <aside className="about-scroll" aria-labelledby="about-heading">
            <h2 id="about-heading">more about me</h2>
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </aside>
        </div>

        <section className="hosting-section" aria-labelledby="hosting-heading">
          <div>
            <p className="hosting-label">fun fact</p>
            <h2 id="hosting-heading">this website is served from my own http server.</h2>
            <p>
              It runs on a personal VPS that also hosts <Link to="/projects">other projects</Link> and{" "}
              <Link to="/fun">fun things</Link> I make along the way.
            </p>
          </div>
        </section>
      </div>

      <section className="notebook-section" aria-labelledby="featured-heading">
        <div className="section-body">
          <div className="section-title-row">
            <h2 id="featured-heading">projects</h2>
            <Link className="text-link" to="/projects">
              all projects →
            </Link>
          </div>

          <div className="featured-projects">
            {projects.slice(0, 3).map((project) => (
              <Link className="featured-project" key={project.slug} to={`/projects/${project.slug}`}>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.descriptor}</p>
                  <small>{project.languages.join(" · ")}</small>
                </div>
                <span className="project-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="notebook-section" aria-labelledby="experience-heading">
        <div className="section-body">
          <div className="section-title-row">
            <h2 id="experience-heading">last summer</h2>
            <Link className="text-link" to="/experience">
              all experience →
            </Link>
          </div>
          <div className="experience-list">
            {experiences.slice(0, 1).map((experience) => (
              <article className="experience-row" key={experience.organization}>
                <div className="experience-meta">
                  <h3>{experience.organization}</h3>
                  <p>{experience.role}</p>
                  <small>{experience.period}</small>
                </div>
                <p>{experience.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="notebook-section" aria-labelledby="articles-heading">
        <div className="section-body">
          <div className="section-title-row">
            <h2 id="articles-heading">notes and articles</h2>
            <Link className="text-link" to="/writing">
              all notes and articles →
            </Link>
          </div>
          <div className="note-preview-list">
            {notes.slice(0, 2).map((note) => (
              <Link className="note-preview" key={note.slug} to={`/writing/${note.slug}`}>
                <div>
                  <time>{note.date}</time>
                  <span>{note.readTime}</span>
                </div>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
