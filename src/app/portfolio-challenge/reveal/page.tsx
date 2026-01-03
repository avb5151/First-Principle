"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

export default function RevealPage() {
  const [stage, setStage] = useState(0);
  const { results } = useGameStore();

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 2000);
    const timer2 = setTimeout(() => setStage(2), 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Calculate total opportunity missed using clamped score values
  const hasResults = Object.keys(results).length > 0;
  const totalGap = hasResults
    ? Object.values(results).reduce((sum: number, r: any) => {
        // Use displayedOptimalScore (clamped) if available, otherwise fall back to optimalScore
        const displayedOptimal = r.displayedOptimalScore !== undefined 
          ? r.displayedOptimalScore 
          : (r.optimalScore !== undefined ? r.optimalScore : r.optimal.totalR);
        const userScore = r.userScore !== undefined ? r.userScore : r.user.totalR;
        return sum + (displayedOptimal - userScore);
      }, 0)
    : 0;
  const avgGap = hasResults ? Math.max(0, totalGap / Object.keys(results).length) : 0;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
                You just experienced what most RIAs face every day.
              </h1>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="problem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-semibold mb-8 leading-tight">
                Manually toggling allocations.<br />
                <span className="text-white/70">Reacting to markets after the fact.</span>
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Hoping diversification holds when it matters most.
              </p>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="solution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-semibold mb-8 leading-tight">
                First Principle doesn&apos;t guess.
              </h1>
              <p className="text-3xl md:text-4xl font-light text-white/80 mb-8">
                We engineer outcomes.
              </p>
              
              {hasResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-12"
                >
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-8 max-w-2xl mx-auto">
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-4">What You Missed</p>
                    <p className="text-4xl md:text-5xl font-semibold text-amber-400 mb-2">
                      {avgGap > 0.5 ? `+${avgGap.toFixed(1)}` : "Matched"}
                    </p>
                    <p className="text-white/70 text-lg">
                      Average performance gap per market environment
                    </p>
                    <p className="text-white/50 text-sm mt-4">
                      Across all three market environments, a First Principle-optimized approach would have delivered better risk-adjusted returns.
                    </p>
                  </div>
                </motion.div>
              )}
              
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
                Using our proprietary data-driven and tested approach, we optimize your unique portfolio
                across market environments. No manual toggling. No reactive guessing. Just systematic outcome engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/portfolio-challenge/dashboard"
                  className="inline-block rounded-xl bg-white text-black px-10 py-4 font-medium hover:bg-white/90 transition-colors text-lg"
                >
                  Explore Our Approach
                </Link>
                <a
                  href="/institutional/index.html"
                  className="inline-block rounded-xl border border-white/20 px-10 py-4 text-white/80 hover:bg-white/5 hover:border-white/30 transition-colors text-lg"
                >
                  Visit Website →
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

