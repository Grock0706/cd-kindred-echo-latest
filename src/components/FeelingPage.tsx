import { MessageCircle, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FeelingPage({ onSelect }: { onSelect: (choice: string) => void }) {
  return (
    <main className="feeling-root">
      <div className="feeling-card">
        <h1 className="feeling-title">How are you feeling today?</h1>
        <p className="feeling-sub">Choose your space to begin.</p>

        <div className="feeling-list">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect("echo")}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onSelect('echo') }}
            className="feeling-tile feeling-echo"
            tabIndex={0}
            aria-label="Choose Echo"
          >
            <span className="feeling-icon">
              <MessageCircle className="feeling-svg" />
            </span>
            <span className="feeling-label">Echo</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect("circles")}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onSelect('circles') }}
            className="feeling-tile feeling-circles"
            tabIndex={0}
            aria-label="Choose Circles"
          >
            <span className="feeling-icon">
              <UserCircle2 className="feeling-svg" />
            </span>
            <span className="feeling-label">Circles</span>
          </motion.button>
        </div>
      </div>
    </main>
  );
}
