import { Allocation } from "./payoff";
import { Scenario } from "./scenarios";

export type ScenarioOutcome = {
  totalR: number;
  maxDD: number;
  income: number;
};

export type ObjectiveMetrics = {
  meanR: number;
  cvar10: number; // Conditional Value at Risk (average of worst 10%)
  meanDD: number;
  meanIncome: number;
  penaltyDiv: number;
  penaltyConstraints: number;
  score: number;
};

// Compute CVaR (average of worst 10% of outcomes)
function computeCVaR10(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const worst10Count = Math.max(1, Math.ceil(sorted.length * 0.1));
  const worst10 = sorted.slice(0, worst10Count);
  return worst10.reduce((sum, v) => sum + v, 0) / worst10Count;
}

export function computeObjective(
  outcomes: ScenarioOutcome[],
  allocation: Allocation
): ObjectiveMetrics {
  const returns = outcomes.map(o => o.totalR);
  const drawdowns = outcomes.map(o => o.maxDD);
  const incomes = outcomes.map(o => o.income);

  const meanR = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const cvar10 = computeCVaR10(returns);
  const meanDD = drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length;
  const meanIncome = incomes.reduce((sum, inc) => sum + inc, 0) / incomes.length;

  // Diversification regularization: penalize concentration
  // L2 penalty on weights: makes 100% weights expensive
  const l2 = allocation.fi ** 2 + allocation.eq ** 2 + allocation.struct ** 2;
  const penaltyDiv = 25 * l2;

  // Soft constraints: penalize weights > 80% or structured > 60%
  let penaltyConstraints = 0;
  if (allocation.fi > 0.80) {
    penaltyConstraints += 200 * (allocation.fi - 0.80) ** 2;
  }
  if (allocation.eq > 0.80) {
    penaltyConstraints += 200 * (allocation.eq - 0.80) ** 2;
  }
  if (allocation.struct > 0.60) {
    penaltyConstraints += 150 * (allocation.struct - 0.60) ** 2;
  }
  if (allocation.struct > 0.80) {
    penaltyConstraints += 200 * (allocation.struct - 0.80) ** 2;
  }

  // Score function:
  // - meanR * 100: reward return
  // - meanIncome * 15: reward income (reduced weight)
  // - cvar10 * 120: penalize tail loss (CVaR is negative, so this is a penalty)
  // - meanDD * 60: penalize drawdown
  // - penalties: subtract diversification and constraint penalties
  const score =
    meanR * 100 +
    meanIncome * 15 -
    meanDD * 60 +
    cvar10 * 120 - // CVaR is negative, so multiplying by positive gives penalty
    penaltyDiv -
    penaltyConstraints;

  return {
    meanR,
    cvar10,
    meanDD,
    meanIncome,
    penaltyDiv,
    penaltyConstraints,
    score,
  };
}

