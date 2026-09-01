import { Link } from "react-router-dom";
import { projects } from "@/content/siteContent";

export function ProjectsPage() {
  return (
    <div className="notebook-page">
      <header className="page-header">
        <p className="kicker">project index / source, decisions, measurements</p>
        <h1>projects</h1>
        <p>
          I learn best by building. Each write-up follows what drew me to the idea, the decisions I made along the
          way, and the evidence I have so far.
        </p>
      </header>

      <div className="project-index-list">
        {projects.map((project, index) => (
          <article className="project-index-entry" key={project.slug}>
            <span className="project-index-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="project-index-main">
              <div className="project-index-title">
                <div>
                  <h2>
                    <Link to={`/projects/${project.slug}`}>{project.name}</Link>
                  </h2>
                  <p>{project.descriptor}</p>
                </div>
                <span className="status-label">{project.status}</span>
              </div>
              <p className="project-index-summary">{project.summary}</p>
              <div className="project-index-footer">
                <span>{project.languages.join(" · ")}</span>
                <Link className="text-link" to={`/projects/${project.slug}`}>
                  read field notes →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
