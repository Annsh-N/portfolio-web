import { motion } from "framer-motion";
import { MessageSquareCode, RadioTower } from "lucide-react";

export function MessageMePage() {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className="page-shell projects-shell" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.45 }}>
      <section className="panel projects-placeholder">
        <div className="projects-icons">
          <MessageSquareCode size={24} />
          <RadioTower size={24} />
        </div>
        <span className="eyebrow">Message Me</span>
        <h1>Desk-display pipeline reserved for the next backend pass.</h1>
        <p>
          This route is in place for the ESP32 message flow. The next pass can turn it into a live form that
          validates input, queues messages on the server, and forwards them to the desk display.
        </p>
      </section>
    </motion.div>
  );
}
