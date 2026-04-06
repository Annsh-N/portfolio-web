import { motion } from "framer-motion";
import { FileText, ScanSearch } from "lucide-react";

export function ResumePage() {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="page-shell projects-shell" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.45 }}>
      <section className="panel projects-placeholder">
        <div className="projects-icons">
          <FileText size={24} />
          <ScanSearch size={24} />
        </div>
        <span className="eyebrow">Resume Page</span>
        <h1>Resume surface reserved for a cleaner handoff.</h1>
        <p>
          This tab is intentionally in place now. The next pass can turn it into a polished recruiter-facing
          resume view or downloadable document hub without changing the navigation structure.
        </p>
      </section>
    </motion.div>
  );
}
