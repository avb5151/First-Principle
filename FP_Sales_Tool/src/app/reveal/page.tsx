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
              <p className="text-3xl md:text-4xl font-light text-white/80 mb-12">
                We engineer outcomes.
              </p>
              <p className="text-xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
                Using our proprietary data-driven and tested approach, we optimize your unique portfolio
                across market regimes. No manual toggling. No reactive guessing. Just systematic outcome engineering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-block rounded-xl bg-white text-black px-10 py-4 font-medium hover:bg-white/90 transition-colors text-lg"
                >
                  Explore Our Approach
                </Link>
                <a
                  href="/institutional/index.html"
                  target="_blank"
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

