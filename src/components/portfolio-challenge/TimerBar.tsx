"use client";
import { motion } from "framer-motion";

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
}

export default function TimerBar({ timeLeft, totalTime }: TimerBarProps) {
  const progress = timeLeft / totalTime;
  const isLow = timeLeft <= 10;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">Time Remaining</span>
        <span className={`text-2xl font-semibold tabular-nums ${isLow ? "text-red-400" : "text-white"}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className={`h-full ${isLow ? "bg-red-400" : "bg-white"}`}
        />
      </div>
    </div>
  );
}

