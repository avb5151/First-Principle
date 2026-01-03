/**
 * Portfolio Outcome Score Objective
 * 
 * The objective is to construct portfolios with the best risk-adjusted returns,
 * as measured by the Portfolio Outcome Score. This score evaluates portfolios
 * across multiple dimensions:
 * 
 * - Total Return (meanR): Rewards higher expected returns
 * - Income Generation (meanIncome): Rewards consistent income streams
 * - Risk Management: Penalizes drawdowns (meanDD) and tail risk (CVaR10)
 * - Diversification: Strongly penalizes concentrated portfolios
 * - Constraints: Enforces reasonable allocation limits
 * 
 * The Portfolio Outcome Score is designed to be positive for well-constructed
 * portfolios, with higher scores indicating better risk-adjusted performance.
 * The optimizer searches for allocations that maximize this score.
 */

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
  portfolioOutcomeScore: number; // Risk-adjusted portfolio performance score
};

/**
 * Constant offset to ensure Portfolio Outcome Scores are positive.
 * This makes scores more interpretable - higher is better, and optimal
 * portfolios will have positive scores.
 */
const PORTFOLIO_OUTCOME_SCORE_OFFSET = 400;

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

  // Diversification regularization: STRONG penalties for concentration
  // Heavily penalize lack of diversification (100% in any single asset class)
  // L2 penalty on weights: makes concentrated portfolios expensive
  const l2 = allocation.fi ** 2 + allocation.eq ** 2 + allocation.struct ** 2;
  // Increased from 25 to 150 - much stronger penalty
  const penaltyDiv = 150 * l2;

  // Strong constraints: heavily penalize weights > 70%
  let penaltyConstraints = 0;
  if (allocation.fi > 0.70) {
    // Quadratic penalty that grows quickly
    penaltyConstraints += 500 * (allocation.fi - 0.70) ** 2;
  }
  if (allocation.eq > 0.70) {
    // Very strong penalty for >70% equities (prevents 100% equity gaming)
    penaltyConstraints += 800 * (allocation.eq - 0.70) ** 2;
  }
  if (allocation.eq > 0.85) {
    // Even stronger penalty for >85% equities
    penaltyConstraints += 1500 * (allocation.eq - 0.85) ** 2;
  }
  if (allocation.struct > 0.60) {
    penaltyConstraints += 300 * (allocation.struct - 0.60) ** 2;
  }
  if (allocation.struct > 0.80) {
    penaltyConstraints += 500 * (allocation.struct - 0.80) ** 2;
  }
  
  // Additional penalty for extreme concentration
  // Penalize if any single asset class is > 90%
  if (allocation.fi > 0.90 || allocation.eq > 0.90 || allocation.struct > 0.90) {
    const maxWeight = Math.max(allocation.fi, allocation.eq, allocation.struct);
    penaltyConstraints += 2000 * (maxWeight - 0.90) ** 2;
  }

  // Portfolio Outcome Score calculation:
  // - meanR * 100: reward return
  // - meanIncome * 15: reward income (reduced weight)
  // - cvar10 * 120: penalize tail loss (CVaR is negative, so this is a penalty)
  // - meanDD * 60: penalize drawdown
  // - penalties: subtract diversification and constraint penalties
  // - PORTFOLIO_OUTCOME_SCORE_OFFSET: shift scale to ensure positive scores
  const portfolioOutcomeScore =
    PORTFOLIO_OUTCOME_SCORE_OFFSET +
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
    portfolioOutcomeScore,
  };
}

