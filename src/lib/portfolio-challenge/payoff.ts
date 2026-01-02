import { Regime } from "./levels";
import { Scenario } from "./scenarios";

export type EquityNoteTerms = {
  buffer: number;         // 0.10 = 10%
  cap: number | null;     // null = uncapped
  participation: number;  // 1.0 = 100%
};

export type IncomeNoteTerms = {
  coupon: number;         // 0.10 = 10% annualized-ish proxy
  barrier: number;        // 0.70 = 70% barrier
  protection: "hard" | "soft";
};

export type Allocation = {
  fi: number;      // 0..1
  eq: number;      // 0..1
  struct: number;  // 0..1
  equityNote: EquityNoteTerms;
  incomeNote: IncomeNoteTerms;
  // split inside structured (keep simple for v1)
  structSplitEquityNote: number; // 0..1
};

export function equityNoteReturn(rEq: number, t: EquityNoteTerms): number {
  if (rEq >= 0) {
    const upside = rEq * t.participation;
    return t.cap == null ? upside : Math.min(upside, t.cap);
  }
  // downside
  if (rEq >= -t.buffer) return 0;
  return rEq + t.buffer;
}

export function incomeNoteReturn(rEq: number, regime: Regime, t: IncomeNoteTerms): { total: number; income: number; principalHit: number } {
  // Coupon gates: pay ONLY if NOT in severe stress and equity not below trigger
  // Stricter than before: regime.stress < 0.7 AND rEq > -0.18
  const couponPays = regime.stress < 0.7 && rEq > -0.18;
  const income = couponPays ? t.coupon * 0.25 : 0; // quarterly proxy

  // Principal behavior: if equity return breaches barrier, principal takes hit
  const barrierLoss = -(1 - t.barrier); // e.g., barrier 0.7 => -0.3
  let principalHit = 0;

  if (rEq < barrierLoss) {
    // Barrier breached: calculate principal loss
    const breachAmount = rEq - barrierLoss; // negative when breached (e.g., -0.35 - (-0.3) = -0.05)
    if (t.protection === "hard") {
      // Hard protection: still loses but dampened (65% of breach)
      principalHit = breachAmount * 0.65;
    } else {
      // Soft protection: full participation beyond barrier
      principalHit = breachAmount;
    }
  }

  // Ensure principalHit is negative or zero when breached (sign check)
  if (rEq < barrierLoss && principalHit > 0) {
    principalHit = 0;
  }

  const total = income + principalHit; // principalHit is negative or 0
  return { total, income, principalHit };
}

// Evaluate portfolio outcome for a single scenario (used in optimizer)
export function portfolioOutcomeScenario(scenario: Scenario, regime: Regime, a: Allocation) {
  const rEq = scenario.equityReturn;
  const rFi = scenario.bondReturn;

  const rEN = equityNoteReturn(rEq, a.equityNote);
  const inc = incomeNoteReturn(rEq, regime, a.incomeNote);

  const structR =
    a.structSplitEquityNote * rEN +
    (1 - a.structSplitEquityNote) * inc.total;

  // Structured drag: base drag + stress-dependent credit spread
  // Per requirements: 0.002 base + regime.stress * 0.004
  const structDrag = 0.002 + regime.stress * 0.004;
  const structRNet = structR - structDrag;

  // Correlation break penalty: naïve EQ+FI diversification degrades in stress
  const naivePenalty = regime.stress * 0.15 * (a.eq * a.fi);

  const totalR = a.fi * rFi + a.eq * rEq + a.struct * structRNet - naivePenalty;

  // Drawdown calculation: account for all components
  const eqContribution = a.eq * rEq;
  const structContribution = a.struct * structRNet;
  const fiContribution = a.fi * rFi;
  const portfolioReturnComponent = eqContribution + structContribution + fiContribution;
  const maxDD = Math.max(0, -portfolioReturnComponent);

  const income = a.struct * (1 - a.structSplitEquityNote) * inc.income;

  return {
    totalR,
    maxDD,
    income,
  };
}

// Legacy function for single-point evaluation (keep for compatibility)
export function portfolioOutcome(regime: Regime, a: Allocation) {
  const scenario: Scenario = {
    equityReturn: regime.equityReturn,
    bondReturn: regime.bondReturn,
  };
  return portfolioOutcomeScenario(scenario, regime, a);
}

