import { motion } from "framer-motion";
import { FolderKanban, Orbit } from "lucide-react";

export function ProjectsPage() {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="page-shell projects-shell" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.45 }}>
      <section className="panel projects-placeholder">
        <div className="projects-icons">
          <FolderKanban size={24} />
          <Orbit size={24} />
        </div>
        <span className="eyebrow">Projects Page</span>
        <h1>Expanding into a deeper project archive.</h1>
        <p>
          The portfolio already surfaces selected systems on the overview page. This dedicated projects area is
          intentionally reserved for richer case studies, architecture breakdowns, and interactive demos next.
        </p>
      </section>
    </motion.div>
  );
}
