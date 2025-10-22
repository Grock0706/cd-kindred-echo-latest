import { Users2, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export default function Circles({ onBack }: { onBack: () => void }) {
  return (
    <main className="circles-wrap">
      <div className="circles-card">
        <div className="circles-badge">Coming Soon</div>

        <div>
          <Users2 className="circles-hero-icon" />
          <h1 className="circles-title">Connection Circles</h1>
          <p className="circles-desc">
            This space will soon allow you to share reflections, find empathy, and connect with others through shared experiences.
          </p>

          <motion.div
            className="circles-quote"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeartHandshake className="circles-quote-icon" />
            <p className="circles-quote-text">
              “In the future, Circles will bring Kindred Echo’s heart to life — turning reflection into connection.”
            </p>
          </motion.div>

          <motion.button
            className="circles-cta"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            aria-label="Back to Feeling Page"
          >
            ← Back to Feeling Page
          </motion.button>
        </div>
      </div>
    </main>
  );
}
