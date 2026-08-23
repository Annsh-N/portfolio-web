import { Link } from "react-router-dom";
import { experiences, notes, profile, projects } from "@/content/siteContent";

export function HomePage() {
  return (
    <div className="notebook-page home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <p className="kicker">purdue cs + physics · west lafayette, indiana</p>
        <h1 id="home-title">{profile.name}</h1>
        <p className="home-lede">{profile.introduction}</p>
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

      <div className="rule" />

      <section className="notebook-section about-section" aria-labelledby="about-heading">
        <div className="section-index">00 / about</div>
        <div className="section-body">
          <h2 id="about-heading">I like building things from first principles.</h2>
          <p>{profile.about}</p>
          <p className="current-line">
            Currently building Listen Config, a low-latency control plane for real-time voice agents.
          </p>
        </div>
      </section>

      <section className="notebook-section" aria-labelledby="featured-heading">
        <div className="section-index">01 / projects</div>
        <div className="section-body">
          <div className="section-title-row">
            <h2 id="featured-heading">A few things I have been building</h2>
            <Link className="text-link" to="/projects">
              all projects →
            </Link>
          </div>

          <div className="featured-projects">
            {projects.slice(0, 3).map((project, index) => (
              <Link className="featured-project" key={project.slug} to={`/projects/${project.slug}`}>
                <span className="project-number">0{index + 1}</span>
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
        <div className="section-index">02 / experience</div>
        <div className="section-body">
          <h2 id="experience-heading">Places where I learned by shipping</h2>
          <div className="experience-list">
            {experiences.map((experience) => (
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
        <div className="section-index">03 / articles</div>
        <div className="section-body">
          <div className="section-title-row">
            <h2 id="articles-heading">Things I have written after building</h2>
            <Link className="text-link" to="/writing">
              all articles →
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

      <section className="home-signoff">
        <p>
          In my free time, I like to make some <Link to="/play">fun projects</Link> too.
        </p>
      </section>
    </div>
  );
}
