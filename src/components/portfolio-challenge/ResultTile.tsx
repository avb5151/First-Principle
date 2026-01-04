"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AccentVariant = "neutral" | "green" | "amber" | "red";

interface ResultTileProps {
  title: string;
  value: number | string;
  subtitle?: string;
  subtitle2?: string;
  accent?: AccentVariant;
  delay?: number;
  animateCountUp?: boolean;
  animateCountDown?: boolean;
  countUpDuration?: number;
  showPop?: boolean;
  showPulse?: boolean;
  showSnap?: boolean;
}

export default function ResultTile({
  title,
  value,
  subtitle,
  subtitle2,
  accent = "neutral",
  delay = 0,
  animateCountUp = false,
  animateCountDown = false,
  countUpDuration = 800,
  showPop = false,
  showPulse = false,
  showSnap = false,
}: ResultTileProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(
    (animateCountUp || animateCountDown) && typeof value === "number" ? 0 : value
  );

  // Count-up or count-down animation
  useEffect(() => {
    if ((!animateCountUp && !animateCountDown) || typeof value !== "number" || prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;
    const duration = animateCountDown ? countUpDuration * 1.5 : countUpDuration; // Slower for count-down

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animateCountUp, animateCountDown, countUpDuration, prefersReducedMotion]);

  // Determine accent colors
  const accentColors = {
    neutral: "text-white",
    green: "text-green-500", // Faint green for optimal score
    amber: "text-amber-400",
    red: "text-red-400",
  };

  const accentColor = accentColors[accent];
  const valueColor = typeof value === "number" && value < 0 ? "text-red-400" : accentColor;

  // Format display value
  const formatValue = (val: number | string): string => {
    if (typeof val === "string") return val;
    if (val >= 0) return `+${val.toFixed(1)}`;
    return `${val.toFixed(1)}`;
  };

  // Container animation
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      scale: showPop && !prefersReducedMotion ? 1.03 : 1,
      transition: {
        opacity: { duration: 0.4 },
        y: { duration: 0.4, ease: "easeOut" },
        scale: showPop && !prefersReducedMotion
          ? {
              duration: 0.25,
              delay: delay + 0.15,
              ease: "easeOut",
            }
          : undefined,
      },
    },
  };

  // Value animation variants
  const valueVariants = {
    pulse: {
      opacity: [1, 0.88, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    snap: {
      scale: [1, 1.012, 1],
      transition: {
        duration: 0.15,
        ease: "easeOut",
        delay: delay + 0.4,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 flex flex-col items-center text-center"
    >
      <div className="text-white/70 text-lg font-medium mb-4">{title}</div>
      
      <motion.div
        variants={valueVariants}
        animate={
          showSnap && !prefersReducedMotion
            ? "snap"
            : showPulse && !prefersReducedMotion
            ? "pulse"
            : undefined
        }
        className={`text-5xl md:text-6xl font-semibold tabular-nums mb-8 flex-grow flex items-center justify-center ${valueColor}`}
      >
        {formatValue(displayValue)}
      </motion.div>
      
      {subtitle && (
        <div className="text-white/80 text-lg mt-auto font-semibold mb-2">
          {subtitle}
        </div>
      )}
      {subtitle2 && (
        <div className="text-white/80 text-lg font-semibold">
          {subtitle2}
        </div>
      )}
    </motion.div>
  );
}
