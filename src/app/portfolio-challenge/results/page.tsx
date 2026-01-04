"use client";
import { useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { makeDiagnostics } from "@/lib/portfolio-challenge/diagnostics";
import { motion } from "framer-motion";
import ResultTile from "@/components/portfolio-challenge/ResultTile";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelParam = searchParams.get("level");
  const level = levelParam ? parseInt(levelParam) : null;

  const { results, startLevel } = useGameStore();
  const result = level && results[level];

  useEffect(() => {
    if (level && !result) {
      // If no result for this level, redirect to game
      router.push("/portfolio-challenge/game");
    }
  }, [level, result, router]);

  const diagnostics = useMemo(() => {
    if (!level || !result) {
      return { headline: "Opportunity Missed", bullets: [], optimalMechanism: undefined };
    }
    return makeDiagnostics(result);
  }, [level, result]);

  if (!level || !result) {
    return (
      <main className="min-h-screen bg-black text-white grid place-items-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">No results found</p>
          <Link href="/portfolio-challenge/game" className="text-white underline hover:text-white/80">
            Return to game
          </Link>
        </div>
      </main>
    );
  }

  const { regime, user, userAlloc, optimal, optimalAlloc, userPortfolioOutcomeScore, optimalPortfolioOutcomeScore, displayedOptimalPortfolioOutcomeScore } = result;
  
  // Use clamped optimal Portfolio Outcome Score for gap calculation (guarantees >= 0)
  // Score gap represents the difference in risk-adjusted performance
  const EPS = 1e-6;
  const gap = displayedOptimalPortfolioOutcomeScore - userPortfolioOutcomeScore;
  const isMatched = gap <= 0.5; // Small epsilon for "matched" threshold (scores are larger numbers)
  const opportunityCost = gap;
  const OPPORTUNITY_COST_THRESHOLD = 5;
  const isHighOpportunityCost = opportunityCost > OPPORTUNITY_COST_THRESHOLD;
  const isLowOpportunityCost = opportunityCost <= OPPORTUNITY_COST_THRESHOLD;
  const nextLevel = level < 3 ? (level + 1) as 1 | 2 | 3 : null;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-white/50 text-sm uppercase tracking-widest mb-1">
            Level {level} Results
          </div>
          <h1 className="text-4xl font-semibold mb-2">{regime.name}</h1>
          <div className="text-xl text-white/70">{regime.subtitle}</div>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ResultTile
            title="Your Portfolio Outcome Score"
            value={userPortfolioOutcomeScore}
            subtitle={`Max Drawdown: ${formatPercent(user.maxDD)}`}
            subtitle2={`Income: ${formatPercent(user.income)}`}
            accent="neutral"
            delay={0.1}
          />

          <ResultTile
            title="First Principle-Optimized Portfolio Outcome Score"
            value={displayedOptimalPortfolioOutcomeScore}
            subtitle={`Max Drawdown: ${formatPercent(optimal.maxDD)}`}
            subtitle2={`Income: ${formatPercent(optimal.income)}`}
            accent={isLowOpportunityCost ? "green" : "neutral"}
            delay={0.2}
            showPulse={isLowOpportunityCost}
          />

          <ResultTile
            title="Opportunity Cost"
            value={isMatched ? "Matched" : opportunityCost}
            subtitle={isMatched ? "Matched Optimal" : "Performance Gap"}
            accent={isMatched ? "neutral" : isHighOpportunityCost ? "red" : "amber"}
            delay={0.35}
            animateCountUp={!isMatched}
            showPop={isHighOpportunityCost}
            showSnap={isHighOpportunityCost}
          />
        </div>

        {/* Allocation Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Allocation Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-white/60 text-sm mb-4">Your Allocation</div>
              <div className="space-y-3">
                <AllocationBar label="Fixed Income" value={userAlloc.fi} color="#3b82f6" />
                <AllocationBar label="Equities" value={userAlloc.eq} color="#10b981" />
                <AllocationBar label="Structured" value={userAlloc.struct} color="#f59e0b" />
              </div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-4">Optimal Allocation</div>
              <div className="space-y-3">
                <AllocationBar label="Fixed Income" value={optimalAlloc.fi} color="#3b82f6" />
                <AllocationBar label="Equities" value={optimalAlloc.eq} color="#10b981" />
                <AllocationBar label="Structured" value={optimalAlloc.struct} color="#f59e0b" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Opportunity Missed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">{diagnostics.headline}</h2>
          <ul className="space-y-3 mb-6">
            {diagnostics.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start">
                <span className="text-white/40 mr-3 mt-1">•</span>
                <span className="text-white/80 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          {diagnostics.optimalMechanism && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-white/60 text-sm uppercase tracking-wider mb-2">Optimal Mechanism</div>
              <p className="text-white/90 leading-relaxed">{diagnostics.optimalMechanism}</p>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {nextLevel ? (
            <>
              <Link
                href="/portfolio-challenge/game"
                onClick={() => startLevel(nextLevel)}
                className="flex-1 rounded-xl bg-white text-black px-8 py-4 font-medium hover:bg-white/90 transition-colors text-center"
              >
                Continue to Level {nextLevel}
              </Link>
              <Link
                href="/portfolio-challenge"
                className="rounded-xl border border-white/20 px-8 py-4 text-white/80 hover:bg-white/5 transition-colors text-center"
              >
                Restart Later
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/portfolio-challenge/reveal"
                className="flex-1 rounded-xl bg-white text-black px-8 py-4 font-medium hover:bg-white/90 transition-colors text-center"
              >
                See the Reveal
              </Link>
              <Link
                href="/portfolio-challenge"
                className="rounded-xl border border-white/20 px-8 py-4 text-white/80 hover:bg-white/5 transition-colors text-center"
              >
                Restart
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function AllocationBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm tabular-nums text-white/60">{formatPercent(value)}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ backgroundColor: color }}
          className="h-full"
        />
      </div>
    </div>
  );
}

function formatPercent(value: number): string {
  const percent = value * 100;
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

function formatPercentPositive(value: number): string {
  // Always show positive, never negative sign
  const percent = Math.max(0, value * 100);
  return `+${percent.toFixed(1)}%`;
}

function formatScore(value: number): string {
  // Score is already in the right units (risk-adjusted metric)
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

function formatScorePositive(value: number): string {
  // Always show positive, never negative sign
  const score = Math.max(0, value);
  return `+${score.toFixed(1)}`;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white grid place-items-center">
        <div className="text-center">
          <p className="text-white/60">Loading results...</p>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}

