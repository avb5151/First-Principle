import { Allocation, portfolioOutcomeScenario } from "./payoff";
import { MarketEnvironment } from "./levels";
import { generateScenarios, Scenario } from "./scenarios";
import { computeObjective, ObjectiveMetrics, ScenarioOutcome } from "./objective";

const DEBUG_MODE = false; // Set to true to see top candidates

export type OptimizerDebugInfo = {
  allocation: Allocation;
  score: number;
  metrics: ObjectiveMetrics;
};

export function findOptimal(
  environment: MarketEnvironment,
  base: {
    equityNote: Allocation["equityNote"];
    incomeNote: Allocation["incomeNote"];
  }
) {
  // Generate scenarios for this market environment
  const scenarios = generateScenarios(environment, 50);

  let best: { a: Allocation; score: number; metrics: ObjectiveMetrics } | null = null;
  const candidates: OptimizerDebugInfo[] = [];

  // Finer grid: 5% steps (0, 5, 10, ..., 100)
  for (let fi = 0; fi <= 100; fi += 5) {
    for (let eq = 0; eq <= 100 - fi; eq += 5) {
      const struct = 100 - fi - eq;
      if (struct < 0) continue;

      const structWeight = struct / 100;
      const fiWeight = fi / 100;
      const eqWeight = eq / 100;

      // Ensure weights sum to exactly 1 (handle floating point)
      const total = fiWeight + eqWeight + structWeight;
      if (Math.abs(total - 1.0) > 0.001) continue;

      // Try different structured splits
      for (const split of [0.0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0]) {
        // Try different equity note terms
        for (const buffer of [0.10, 0.15, 0.20, 0.30]) {
          for (const cap of [0.08, 0.10, 0.12, 0.15, null]) {
            // Try different income note terms
            for (const coupon of [0.06, 0.08, 0.10, 0.12]) {
              for (const barrier of [0.60, 0.70, 0.80]) {
                for (const protection of ["hard", "soft"] as const) {
                  const a: Allocation = {
                    fi: fiWeight,
                    eq: eqWeight,
                    struct: structWeight,
                    structSplitEquityNote: split,
                    equityNote: { ...base.equityNote, buffer, cap },
                    incomeNote: { coupon, barrier, protection },
                  };

                  // Evaluate across all scenarios
                  const scenarioOutcomes: ScenarioOutcome[] = scenarios.map(scenario =>
                    portfolioOutcomeScenario(scenario, environment, a)
                  );

                  // Compute objective metrics (mean, CVaR, penalties, etc.)
                  const metrics = computeObjective(scenarioOutcomes, a);
                  const s = metrics.score;

                  // Store for debug
                  if (DEBUG_MODE && candidates.length < 5) {
                    candidates.push({
                      allocation: a,
                      score: s,
                      metrics,
                    });
                  }

                  if (!best || s > best.score) {
                    best = { a, score: s, metrics };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Debug output
  if (DEBUG_MODE && best) {
    console.log(`\n=== Level ${environment.id} Optimal Search ===`);
    console.log(`Market Environment: ${environment.name} (${environment.subtitle})`);
    console.log(`Stress: ${environment.stress}`);
    console.log(`Scenarios: ${scenarios.length}`);
    console.log(`\nTop 5 Candidates:`);
    candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach((c, i) => {
        console.log(`\n${i + 1}. Score: ${c.score.toFixed(2)}`);
        console.log(`   Allocation: FI=${(c.allocation.fi * 100).toFixed(0)}%, EQ=${(c.allocation.eq * 100).toFixed(0)}%, Struct=${(c.allocation.struct * 100).toFixed(0)}%`);
        console.log(`   meanR: ${(c.metrics.meanR * 100).toFixed(2)}%, CVaR10: ${(c.metrics.cvar10 * 100).toFixed(2)}%, meanDD: ${(c.metrics.meanDD * 100).toFixed(2)}%`);
        console.log(`   meanIncome: ${(c.metrics.meanIncome * 100).toFixed(2)}%`);
        console.log(`   penaltyDiv: ${c.metrics.penaltyDiv.toFixed(2)}, penaltyConstraints: ${c.metrics.penaltyConstraints.toFixed(2)}`);
      });
    console.log(`\nBest: Score=${best.score.toFixed(2)}`);
    console.log(`Allocation: FI=${(best.a.fi * 100).toFixed(0)}%, EQ=${(best.a.eq * 100).toFixed(0)}%, Struct=${(best.a.struct * 100).toFixed(0)}%`);
    console.log(`meanR: ${(best.metrics.meanR * 100).toFixed(2)}%, CVaR10: ${(best.metrics.cvar10 * 100).toFixed(2)}%, meanDD: ${(best.metrics.meanDD * 100).toFixed(2)}%\n`);
  }

  if (!best) {
    throw new Error(`No optimal allocation found for market environment ${environment.id}`);
  }

  // Return format compatible with existing code (need to compute single-point outcome)
  // Use the market environment anchor point for display purposes
  const anchorScenario: Scenario = {
    equityReturn: environment.equityReturn,
    bondReturn: environment.bondReturn,
  };
  const anchorOutcome = portfolioOutcomeScenario(anchorScenario, environment, best.a);

  return {
    a: best.a,
    score: best.score,
    outcome: anchorOutcome,
  };
}

