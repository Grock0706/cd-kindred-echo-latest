import { Users2, HeartHandshake } from "lucide-react"
import { motion } from "framer-motion"
import React from "react"

export default function Circles({ onBack }: { onBack: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F6] text-[#1A1A1A]">
      <div className="relative bg-white p-10 rounded-3xl shadow-lg max-w-sm w-full text-center overflow-hidden">

        {/* Coming Soon Badge */}
        <motion.div
          className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-[#FBDAD3] text-[#1A1A1A] shadow-md"
          animate={{ opacity: [0.8, 1, 0.8], scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Coming Soon
        </motion.div>

        <div className="flex flex-col items-center gap-4">
          <div className="icon-circle mb-2">
            <Users2 size={36} />
          </div>
          <h2 className="text-2xl font-semibold">Circles — Community Connection</h2>
          <p className="muted" style={{ maxWidth: 340 }}>
            A gentle place to share with people you trust. We're building a simple, caring
            flow where you can invite your circles, share moments, and offer support — all
            at your pace. For now, this space is a small, thoughtful placeholder while we
            craft a safe connection experience.
          </p>

          <div className="flex gap-3 mt-4">
            <motion.button
              onClick={onBack}
              className="cta"
              aria-label="Back to how are you feeling"
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              Back to Feeling Page
            </motion.button>

            <motion.button
              onClick={() => alert("We're not quite ready — stay tuned!")}
              className="secondary"
              aria-label="Learn more"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  )
}
