"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

type QuadrantId = "edge" | "strategy" | "impact" | "contact" | null;

export default function DashboardPage() {
  const [activeQuad, setActiveQuad] = useState<QuadrantId>(null);
  const { results } = useGameStore();

  const quadrants = [
    {
      id: "edge" as QuadrantId,
      title: "Our Edge",
      subtitle: "Learn about our expertise",
      position: "top-left",
    },
    {
      id: "strategy" as QuadrantId,
      title: "Dive into the Strategy",
      subtitle: "See the engine",
      position: "top-right",
    },
    {
      id: "impact" as QuadrantId,
      title: "Preview Your Impact",
      subtitle: "Before vs after",
      position: "bottom-left",
    },
    {
      id: "contact" as QuadrantId,
      title: "Get in Touch",
      subtitle: "Supercharge your portfolio",
      position: "bottom-right",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-white/50 text-sm uppercase tracking-widest mb-2">
            The Reveal
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Stop toggling. Start engineering outcomes.
          </h1>
          <p className="text-xl text-white/70 max-w-3xl">
            Most portfolios are built by manually adjusting exposures and hoping diversification holds.
            First Principle uses a systematic, tested approach to optimize for your objectives across regimes.
            <a href="/institutional/index.html" target="_blank" className="text-amber-400 hover:text-amber-300 underline ml-2">Learn more →</a>
          </p>
        </motion.div>

        {/* 4-Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quadrants.map((quad, index) => (
            <QuadrantCard
              key={quad.id}
              quad={quad}
              isActive={activeQuad === quad.id}
              onActivate={() => setActiveQuad(activeQuad === quad.id ? null : quad.id)}
              index={index}
            />
          ))}
        </div>

        {/* Expanded Content Overlay */}
        <AnimatePresence>
          {activeQuad && (
            <QuadrantExpanded
              quadId={activeQuad}
              onClose={() => setActiveQuad(null)}
              results={results}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function QuadrantCard({
  quad,
  isActive,
  onActivate,
  index,
}: {
  quad: { id: QuadrantId; title: string; subtitle: string; position: string };
  isActive: boolean;
  onActivate: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onActivate}
      className={`rounded-2xl border ${
        isActive ? "border-white/30 bg-white/5" : "border-white/10 bg-white/[0.02]"
      } backdrop-blur-sm p-8 text-left hover:bg-white/5 transition-all h-full`}
    >
      <div className="text-white/60 text-sm mb-2">{quad.subtitle}</div>
      <div className="text-2xl font-semibold mb-4">{quad.title}</div>
      <div className="text-white/70">
        {isActive ? "Click to collapse" : "Click to explore →"}
      </div>
    </motion.button>
  );
}

function QuadrantExpanded({
  quadId,
  onClose,
  results,
}: {
  quadId: QuadrantId;
  onClose: () => void;
  results: any;
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
      />

      {/* Content Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-20 z-50 bg-black border border-white/20 rounded-2xl p-8 md:p-12 overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors text-2xl"
        >
          ×
        </button>

        {quadId === "edge" && <EdgeContent />}
        {quadId === "strategy" && <StrategyContent />}
        {quadId === "impact" && <ImpactContent results={results} />}
        {quadId === "contact" && <ContactContent />}
      </motion.div>
    </>
  );
}

function EdgeContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Our Edge</h2>
      <div className="space-y-6 text-white/80 leading-relaxed">
        <p className="text-lg">
          Most investment advisors build portfolios through intuition and manual adjustment.
          First Principle replaces guesswork with systematic outcome engineering.
        </p>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">What Makes Us Different</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-white/40 mr-3 mt-1">•</span>
              <span>
                <strong className="text-white">Systematic Volatility Capture:</strong> We implement disciplined option-selling programs across diversified index underlyings (SPX, NDX, RUT, SX5E), targeting the structural gap between implied and realized volatility rather than short-term market calls. <a href="/institutional/product.html" target="_blank" className="text-amber-400 hover:text-amber-300 underline">Learn more about our strategy →</a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white/40 mr-3 mt-1">•</span>
              <span>
                <strong className="text-white">Engineered Payoff Geometry:</strong> Barrier levels, coupon structures, and maturities are engineered to reshape the distribution of outcomes relative to long-only equity or credit. Notes typically employ transparent barriers (e.g., 50–80% of initial index level) with clearly defined downside participation.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white/40 mr-3 mt-1">•</span>
              <span>
                <strong className="text-white">Institutional Integration & Governance:</strong> Structured-note sleeves are sized and slotted into existing equity or fixed income allocations—not layered on top. We provide position-level transparency, issuer diversification, and attribution that can be mapped into existing risk, performance, and compliance systems.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-white/40 mr-3 mt-1">•</span>
              <span>
                <strong className="text-white">Born from Institutional Expertise:</strong> First Principle was created by The Invictus Collective, a multi-family office serving ultra-high-net-worth families and institutional clients. <a href="/about.html" target="_blank" className="text-amber-400 hover:text-amber-300 underline">Learn about our team →</a>
              </span>
            </li>
          </ul>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Why Legacy Approaches Fail</h3>
          <p>
            Capital market assumptions have shifted materially. Forward equity returns are lower, volatility is structurally higher, and traditional diversification is less reliable. The portfolio construction playbook that worked in the Quantitative Easing era requires recalibration for today&apos;s and tomorrow&apos;s regime. When correlations converge—as they did in 2008, 2020, and other regime breaks—60/40 portfolios fail to protect capital. First Principle&apos;s approach anticipates these breakdowns and engineers outcomes that preserve capital while maintaining upside participation.
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <a href="/institutional/index.html" target="_blank" className="inline-block rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-colors">
            Explore Our Approach →
          </a>
        </div>
      </div>
    </div>
  );
}

function StrategyContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Dive into the Strategy</h2>
      <div className="space-y-6 text-white/80 leading-relaxed">
        <p className="text-lg">
          We construct diversified, rules-based portfolios of structured notes designed to harvest index option premium across major indices (SPX, NDX, RUT, SX5E). The objective is to convert volatility and skew into stable income and convex payoff profiles while keeping the overall portfolio aligned with existing policy benchmarks and risk budgets.
        </p>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Instruments & Mechanics</h3>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Structured Equity Sleeve</h4>
              <p className="text-white/70">
                Equity-linked structured notes with 12% expected return. These notes provide defined downside protection with barrier levels (typically 50–80% of initial index level) and clearly defined downside participation, allowing ex-ante mapping of behavior under stress, in range-bound markets, and in modestly rising environments.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Structured Fixed Income Sleeve</h4>
              <p className="text-white/70">
                Income-focused structured notes with 10% expected return. These notes provide regular income with barrier-based principal protection, targeting higher cash yields without extending duration or taking on opaque credit risk.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Traditional Allocations</h4>
              <p className="text-white/70">
                Broad-based equities at 7.0% expected annual return and fixed income blended from investment grade and high yield (≈4.58% blended). Structured sleeves are sized and slotted into existing allocations—not layered on top.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Portfolio Construction Framework</h3>
          <p className="mb-4">
            Our systematic approach follows a repeatable process that links client objectives to payoff design, issuer selection, and ongoing risk management:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-white/70 ml-2">
            <li><strong className="text-white">Define the Risk Budget:</strong> We begin with portfolio objectives, volatility tolerance, drawdown limits, and income targets.</li>
            <li><strong className="text-white">Engineer the Payoff Library:</strong> We design a menu of allowed payoff types, barriers, tenors, and underlyings for each strategy.</li>
            <li><strong className="text-white">Optimize Across Regimes:</strong> Our engine evaluates thousands of combinations to optimize for total return, income generation, and drawdown control simultaneously.</li>
          </ol>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Implementation Use Cases</h3>
          <div className="space-y-3 text-white/70">
            <p><strong className="text-white">Enhance Core Fixed Income:</strong> Replace 10–20% of traditional fixed income with structured income sleeves, targeting higher cash yields with defined barrier levels.</p>
            <p><strong className="text-white">Reshape Equity Drawdowns:</strong> Reallocate 15–25% of core equity exposure into structured equity sleeves, maintaining equity-like return potential while introducing buffers and path-dependent income.</p>
            <p><strong className="text-white">Simplify Alternative Credit:</strong> Substitute structured income portfolios for portions of high-yield or alternative credit allocations, targeting comparable or higher yields with more transparent payoff mechanics.</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <p className="text-white/60 italic mb-4">
            &quot;The challenge you just completed demonstrates the difficulty of making optimal decisions under time pressure. Our systematic approach removes that pressure by pre-computing optimal allocations across scenarios.&quot;
          </p>
          <div className="flex gap-4">
            <a href="/institutional/product.html" target="_blank" className="inline-block rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-colors text-sm">
              View Full Strategy Details →
            </a>
            <a href="/institutional/simulator.html" target="_blank" className="inline-block rounded-lg border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5 transition-colors text-sm">
              Try Portfolio Simulator →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactContent({ results }: { results: any }) {
  const hasResults = Object.keys(results).length > 0;
  const totalGap = hasResults
    ? Object.values(results).reduce((sum: number, r: any) => sum + (r.optimal.totalR - r.user.totalR), 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Preview Your Impact</h2>
      <div className="space-y-6 text-white/80 leading-relaxed">
        {hasResults ? (
          <>
            <p className="text-lg">
              Based on your challenge results, here&apos;s what a First Principle-optimized approach could achieve:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Cumulative Gap</div>
                <div className="text-3xl font-semibold text-amber-400">
                  {((totalGap / 3) * 100).toFixed(1)}%
                </div>
                <div className="text-white/50 text-xs mt-2">Average per level</div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Regimes Tested</div>
                <div className="text-3xl font-semibold text-white">3</div>
                <div className="text-white/50 text-xs mt-2">Bull, correction, crash</div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Time Saved</div>
                <div className="text-3xl font-semibold text-white">∞</div>
                <div className="text-white/50 text-xs mt-2">No manual toggling</div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-lg">
            Complete the portfolio challenge to see a personalized impact analysis based on your decisions.
          </p>
        )}

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Real-World Impact</h3>
          <p>
            For a $10M portfolio, even a 0.5% annual improvement in risk-adjusted returns compounds
            meaningfully over time. First Principle&apos;s systematic approach consistently captures these
            improvements through:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 ml-2">
            <li>Better downside protection in stress regimes</li>
            <li>Optimized income generation without sacrificing growth</li>
            <li>Reduced drawdowns that preserve capital for recovery</li>
            <li>Systematic rebalancing that adapts to regime changes</li>
          </ul>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <p className="text-white/60 text-sm mb-2">Ready to see your portfolio optimized?</p>
          <p className="text-white/80 mb-4">
            Schedule a portfolio walkthrough to receive a custom analysis of how First Principle
            can improve your specific allocation. We provide detailed analytics, scenario analysis, and implementation roadmaps.
          </p>
          <a href="/contact.html" target="_blank" className="inline-block rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-colors">
            Schedule a Call →
          </a>
        </div>
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Get in Touch</h2>
      <div className="space-y-6 text-white/80 leading-relaxed">
        <p className="text-lg">
          Ready to transform your portfolio from manual toggling to systematic outcome engineering? Connect with our team to discuss how structured-note portfolios can be integrated into your institutional allocation framework.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Schedule a Call</h3>
            <p className="text-white/70 mb-4">
              Get a personalized analysis of how First Principle can optimize your current allocation across different market regimes. We provide detailed analytics, scenario analysis, and implementation roadmaps.
            </p>
            <a href="/contact.html" target="_blank" className="inline-block rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-colors">
              Schedule a Call →
            </a>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">Explore Resources</h3>
            <p className="text-white/70 mb-4">
              Access analytical frameworks, implementation guidance, and technical resources for structured SMA solutions.
            </p>
            <a href="/resources.html" target="_blank" className="inline-block rounded-lg border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5 transition-colors">
              View Resources →
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Learn More</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/institutional/product.html" target="_blank" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="font-semibold text-white mb-1">Structured Note Strategy</div>
              <div className="text-white/70 text-sm">Learn about our systematic frameworks and implementation approach</div>
            </a>
            <a href="/about.html" target="_blank" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="font-semibold text-white mb-1">About Our Team</div>
              <div className="text-white/70 text-sm">Meet our leadership with institutional expertise</div>
            </a>
            <a href="/institutional/simulator.html" target="_blank" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="font-semibold text-white mb-1">Portfolio Simulator</div>
              <div className="text-white/70 text-sm">Test hypothetical outcomes with structured note portfolios</div>
            </a>
            <a href="/institutional/index.html" target="_blank" className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="font-semibold text-white mb-1">Home</div>
              <div className="text-white/70 text-sm">Explore our approach to portfolio enhancement</div>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
          <div className="space-y-2 text-white/70">
            <p>
              <strong className="text-white">Website:</strong> <a href="/" target="_blank" className="text-amber-400 hover:text-amber-300 underline">firstprincipleam.com</a>
            </p>
            <p>
              <strong className="text-white">Location:</strong> Chicago, IL
            </p>
            <p>
              <strong className="text-white">Company:</strong> First Principle Asset Management · An Invictus Collective Company
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <p className="text-white/60 italic mb-4">
            &quot;You&apos;ve seen the difference systematic optimization makes. Now let&apos;s apply it to your portfolio.&quot;
          </p>
          <a href="/contact.html" target="_blank" className="inline-block rounded-lg bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-colors">
            Partner With First Principle →
          </a>
        </div>
      </div>
    </div>
  );
}

