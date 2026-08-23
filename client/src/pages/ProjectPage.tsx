import { Link, useParams } from "react-router-dom";
import { getProject } from "@/content/siteContent";

export function ProjectPage() {
  const { slug = "" } = useParams();
  const project = getProject(slug);

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <article className="notebook-page project-essay">
      <Link className="back-link" to="/projects">
        ← project index
      </Link>

      <header className="project-essay-header">
        <p className="kicker">
          {project.year} · {project.status}
        </p>
        <h1>{project.name}</h1>
        <p className="project-descriptor">{project.descriptor}</p>
        <blockquote>{project.question}</blockquote>
        <div className="project-actions">
          <a className="primary-text-button" href={project.repository} rel="noreferrer" target="_blank">
            inspect the source ↗
          </a>
          <span>{project.languages.join(" · ")}</span>
        </div>
      </header>

      <section className="project-facts" aria-label="Project measurements">
        {project.facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </section>

      <div className="essay-layout">
        <aside className="essay-margin-note">
          <span>field note</span>
          <p>{project.summary}</p>
        </aside>
        <div className="essay-copy">
          {project.sections.map((section, index) => (
            <section key={section.heading}>
              <div className="essay-section-label">{String(index + 1).padStart(2, "0")}</div>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <nav className="essay-end-nav" aria-label="Project navigation">
        <Link to="/projects">← all projects</Link>
        <Link to="/writing">related articles →</Link>
      </nav>
    </article>
  );
}

function ProjectNotFound() {
  return (
    <div className="notebook-page empty-page">
      <p className="kicker">404 / missing field note</p>
      <h1>This project page does not exist.</h1>
      <Link className="text-link" to="/projects">
        return to the project index →
      </Link>
    </div>
  );
}
