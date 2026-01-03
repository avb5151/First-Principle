"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function BriefingPage() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after 2 seconds
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/portfolio-challenge/game");
  };

  // Auto-advance after 2.5 seconds if button not clicked
  useEffect(() => {
    const autoAdvanceTimer = setTimeout(() => {
      if (!showButton) {
        router.push("/portfolio-challenge/game");
      }
    }, 2500);

    return () => clearTimeout(autoAdvanceTimer);
  }, [showButton, router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-6xl font-semibold mb-8 leading-tight"
          >
            Your Mission
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            <p>
              You&apos;re an investor allocating across equities, fixed income, and structured strategies. You&apos;ll make decisions quickly using intuition—just like most real portfolios are built.
            </p>
            <p>
              You&apos;re scored on a single objective: maximize returns while keeping downside controlled in this market environment.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-sm text-white/50 max-w-xl mx-auto mb-12"
          >
            Score is based on performance across a range of outcomes consistent with the market environment—not a single point forecast.
          </motion.p>

          <AnimatePresence>
            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={handleContinue}
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-10 py-4 font-medium hover:bg-white/90 transition-colors text-lg"
              >
                Begin Level 1 →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

