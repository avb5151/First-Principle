"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LEVELS } from "@/lib/portfolio-challenge/levels";
import { useGameStore } from "@/store/gameStore";
import AllocationSliders from "@/components/portfolio-challenge/AllocationSliders";
import StructuredProfilePanel from "@/components/portfolio-challenge/StructuredProfilePanel";
import PayoffPreview, { PayoffMetrics } from "@/components/portfolio-challenge/PayoffPreview";
import TimerBar from "@/components/portfolio-challenge/TimerBar";
import { motion } from "framer-motion";

export default function GamePage() {
  const router = useRouter();
  const { level, timeLeft, allocation, tick, finishLevel, startLevel, setAllocation } = useGameStore();

  const environment = LEVELS.find(l => l.id === level)!;

  useEffect(() => {
    startLevel(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      finishLevel();
      router.push(`/portfolio-challenge/results?level=${level}`);
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
          className="flex items-start justify-between mb-6"
        >
          <div>
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">
              Level {level} of 3
            </div>
            <h1 className="text-3xl font-semibold mb-1">{environment.name}</h1>
            <div className="text-lg text-white/70">{environment.subtitle}</div>
            <p className="text-white/50 mt-1 text-sm max-w-2xl">{environment.description}</p>
          </div>
          <div className="text-right">
            <TimerBar timeLeft={timeLeft} totalTime={30} />
          </div>
        </motion.div>

        {/* Main Game Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Row: Allocation and Structured Strategy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6"
          >
            <AllocationSliders allocation={allocation} onChange={setAllocation} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6"
          >
            <StructuredProfilePanel allocation={allocation} onChange={setAllocation} />
          </motion.div>

          {/* Bottom Row: Payoff Chart (left) and Metrics (right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 flex flex-col min-h-[500px]"
          >
            <PayoffPreview 
              allocation={allocation} 
              currentEnvironment={environment}
              compact={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col justify-center"
          >
            <PayoffMetrics allocation={allocation} currentEnvironment={environment} />
          </motion.div>
        </div>

        {/* Footer Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center text-xs text-white/40"
        >
          Adjust your allocation and structured note terms. The payoff curve updates in real time.
        </motion.div>
      </div>
    </main>
  );
}

