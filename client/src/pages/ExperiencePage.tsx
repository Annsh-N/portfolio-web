import { Link } from "react-router-dom";
import { experiences } from "@/content/siteContent";

export function ExperiencePage() {
  return (
    <div className="notebook-page experience-page">
      <header className="page-header">
        <p className="kicker">where I have learned by shipping</p>
        <h1>experience</h1>
        <p>
          A chronological record of the teams, codebases, and engineering problems that have shaped how I build.
        </p>
      </header>

      <div className="experience-archive">
        {experiences.map((experience) => (
          <article className="experience-archive-entry" key={experience.organization}>
            <div className="experience-archive-meta">
              <small>{experience.period}</small>
              <h2>{experience.organization}</h2>
            </div>
            <div className="experience-archive-copy">
              <p className="experience-archive-role">{experience.role}</p>
              <p>{experience.note}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="experience-return">
        <Link to="/projects">← back to projects</Link>
      </p>
    </div>
  );
}
