import { Activity, ArrowUpRight, Atom, CloudSun, GraduationCap, MapPin, MoveRight, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { certifications, experiences, interests, profile } from "@shared/content";
import type { EducationSnapshot, GitHubSnapshot, SemesterCourseNode, SkillState } from "@shared/types";
import { CourseworkGraph } from "@/components/CourseworkGraph";
import { GitHubPulsePanel } from "@/components/GitHubPulsePanel";
import { SectionHeading } from "@/components/SectionHeading";
import { SkillField } from "@/components/SkillField";
import { formatTimeInZone } from "@/lib/format";
import { Link } from "react-router-dom";

type HomePageProps = {
  education: EducationSnapshot;
  github: GitHubSnapshot;
  coursework: SemesterCourseNode[];
  skills: SkillState;
  onGrowSkill: (id: string) => void;
};

export function HomePage({ education, github, coursework, skills, onGrowSkill }: HomePageProps) {
  const now = new Date();
  const timeLabel = formatTimeInZone(now, education.timezone);
  const graduationDate = new Date("2027-05-15T00:00:00-04:00");
  const graduationDaysAway = Math.max(0, Math.ceil((graduationDate.getTime() - now.getTime()) / 86_400_000));

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="page-shell" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.55 }}>
      <section className="hero-grid">
        <motion.div className="hero-copy panel hero-panel" initial={{ opacity: 0, y: 24 }} transition={{ delay: 0.05 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="eyebrow">Backend-first, interaction-aware</span>
          <h1>{profile.name}</h1>
          <p className="hero-summary">{profile.heroSummary}</p>
          <p className="hero-detail">{profile.heroDetail}</p>

          <div className="hero-actions">
            <a className="primary-button" href={profile.linkedinUrl} rel="noreferrer" target="_blank">
              LinkedIn
              <ArrowUpRight size={16} />
            </a>
            <a className="secondary-button" href={profile.githubUrl} rel="noreferrer" target="_blank">
              GitHub
            </a>
            <Link className="tertiary-link" to="/create">
              Launch custom games
              <MoveRight size={16} />
            </Link>
          </div>
        </motion.div>

        <motion.div className="panel portrait-panel" initial={{ opacity: 0, scale: 0.96 }} transition={{ delay: 0.1 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <div className="portrait-frame">
            <img alt="Annsh Navle portrait" src="/profile.jpg" />
          </div>
          <GitHubPulsePanel snapshot={github} />
        </motion.div>
      </section>

      <section className="page-section" id="education">
        <SectionHeading
          description="Live Purdue context and a replayable map of how the coursework builds."
          title="Education"
        />

        <div className="education-grid">
          <div className="education-stack">
            <article className="panel location-panel">
              <div className="location-panel-header">
                <div>
                  <span className="eyebrow">University</span>
                  <h3>{education.school}</h3>
                  <p className="location-degree-line">B.S. in Computer Science and Physics</p>
                </div>
                <GraduationCap size={24} />
              </div>

              <div className="location-campus">
                <MapPin size={15} />
                <span>{education.cityLabel}</span>
              </div>

              <div className="location-highlights">
                <div className="location-weather location-highlight-card">
                  <div className="location-weather-icon">
                    <CloudSun size={22} />
                  </div>
                  <div className="location-weather-copy">
                    <small>Current conditions</small>
                    <strong>
                      {education.weather.temperatureF}
                      {"°F"}
                    </strong>
                    <span>{education.weather.condition}</span>
                  </div>
                </div>

                <div className="location-air location-highlight-card">
                  <div className="location-air-icon">
                    <Activity size={20} />
                  </div>
                  <div className="location-weather-copy">
                    <small>Live AQI</small>
                    <strong>{education.aqi.value}</strong>
                    <span>{education.aqi.category}</span>
                  </div>
                </div>
              </div>

              <div className="location-meta-list">
                <div className="location-meta-item">
                  <RefreshCcw size={15} />
                  <div>
                    <small>Local time</small>
                    <strong>{timeLabel}</strong>
                  </div>
                </div>
                <div className="location-meta-item">
                  <GraduationCap size={15} />
                  <div>
                    <small>Graduation</small>
                    <strong className="location-meta-inline">
                      <span>{profile.graduation}</span>
                      <span aria-hidden="true" className="location-meta-separator" />
                      <span>{graduationDaysAway} days away</span>
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="panel physics-panel">
              <div className="physics-panel-header">
                <div>
                  <span className="eyebrow">Physics degree</span>
                  <h3>Learning the deeper machinery behind computation</h3>
                </div>
                <Atom size={24} />
              </div>

              <p className="physics-copy">
                I&apos;m double-majoring in physics because I like understanding how the universe works from the ground up.
                I&apos;m especially interested in quantum mechanics and where its ideas start to overlap with
                computing, information, and complex technical systems.
              </p>
            </article>
          </div>

          <article className="panel graph-panel">
            <CourseworkGraph nodes={coursework} />
          </article>
        </div>
      </section>

      <section className="page-section" id="experience">
        <SectionHeading
          description="Internship, leadership, and research work across backend, product, and applied systems."
          title="Experience"
        />

        <div className="experience-grid">
          {experiences.map((item) => (
            <article className="panel experience-card" key={`${item.company}-${item.role}`}>
              <div className="experience-topline">
                <span className={`pill pill-${item.kind}`}>{item.kind}</span>
                <small>{item.dateRange}</small>
              </div>
              <h3>{item.role}</h3>
              <p className="experience-meta">
                {item.company} · {item.location}
              </p>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section" id="skills">
        <SectionHeading
          description="Click on a Skill to endorse it (make it bigger) for others to see."
          title="Skills"
        />

        <article className="panel skill-field-panel">
          <SkillField onGrow={onGrowSkill} state={skills} />
        </article>
      </section>

      <section className="page-section">
        <SectionHeading
          description="A few signals around continued learning and the things I keep returning to."
          title="Signals"
        />

        <div className="signal-grid">
          <article className="panel signal-card">
            <span className="eyebrow">Certifications</span>
            <div className="signal-list">
              {certifications.map((cert) => (
                <div className="signal-row" key={cert.name}>
                  <strong>{cert.name}</strong>
                  <small>{cert.date}</small>
                </div>
              ))}
            </div>
          </article>
          <article className="panel signal-card">
            <span className="eyebrow">Interests</span>
            <div className="interest-cloud">
              {interests.map((interest) => (
                <span key={interest}>{interest}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </motion.div>
  );
}
