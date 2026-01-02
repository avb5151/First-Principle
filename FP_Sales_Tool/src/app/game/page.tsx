"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LEVELS } from "@/lib/levels";
import { useGameStore } from "@/store/gameStore";
import AllocationSliders from "@/components/AllocationSliders";
import StructuredToggles from "@/components/StructuredToggles";
import PayoffPreview from "@/components/PayoffPreview";
import TimerBar from "@/components/TimerBar";
import { motion } from "framer-motion";

export default function GamePage() {
  const router = useRouter();
  const { level, timeLeft, allocation, tick, finishLevel, startLevel, setAllocation } = useGameStore();

  const regime = LEVELS.find(l => l.id === level)!;

  useEffect(() => {
    startLevel(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      finishLevel();
      router.push(`/results?level=${level}`);
      return;
    }
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [timeLeft, tick, finishLevel, router, level]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <div className="text-white/50 text-sm uppercase tracking-widest mb-1">
              Level {level} of 3
            </div>
            <h1 className="text-4xl font-semibold mb-2">{regime.name}</h1>
            <div className="text-xl text-white/70">{regime.subtitle}</div>
            <p className="text-white/50 mt-2 max-w-2xl">{regime.description}</p>
          </div>
          <div className="text-right">
            <TimerBar timeLeft={timeLeft} totalTime={30} />
          </div>
        </motion.div>

        {/* Main Game Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Allocation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8"
          >
            <AllocationSliders allocation={allocation} onChange={setAllocation} />
          </motion.div>

          {/* Right Column: Structured Terms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8"
          >
            <StructuredToggles allocation={allocation} onChange={setAllocation} />
          </motion.div>

          {/* Full Width: Payoff Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8"
          >
            <PayoffPreview allocation={allocation} currentRegime={regime} />
          </motion.div>
        </div>

        {/* Footer Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-white/40"
        >
          Adjust your allocation and structured note terms. The payoff curve updates in real time.
        </motion.div>
      </div>
    </main>
  );
}

