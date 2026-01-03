import { Allocation } from "./payoff";
import { MarketEnvironment } from "./levels";

type LevelResult = {
  regime: MarketEnvironment;
  user: { totalR: number; maxDD: number; income: number };
  userAlloc: Allocation;
  optimal: { totalR: number; maxDD: number; income: number };
  optimalAlloc: Allocation;
};

export type Diagnostics = {
  headline: string;
  bullets: string[];
  optimalMechanism?: string;
};

export function makeDiagnostics(result: LevelResult): Diagnostics {
  const { regime, user, userAlloc, optimal, optimalAlloc } = result;
  const gap = optimal.totalR - user.totalR;

  // Compute key differences
  const eqDiff = optimalAlloc.eq - userAlloc.eq;
  const fiDiff = optimalAlloc.fi - userAlloc.fi;
  const structDiff = optimalAlloc.struct - userAlloc.struct;
  const ddDiff = optimal.maxDD - user.maxDD;

  switch (regime.id) {
    case 1:
      return diagnosticsLevel1(result, { eqDiff, fiDiff, structDiff, ddDiff, gap });
    case 2:
      return diagnosticsLevel2(result, { eqDiff, fiDiff, structDiff, ddDiff, gap });
    case 3:
      return diagnosticsLevel3(result, { eqDiff, fiDiff, structDiff, ddDiff, gap });
    default:
      return {
        headline: "Opportunity Missed",
        bullets: ["The optimal portfolio found a more efficient allocation."],
      };
  }
}

function diagnosticsLevel1(
  result: LevelResult,
  diffs: { eqDiff: number; fiDiff: number; structDiff: number; ddDiff: number; gap: number }
): Diagnostics {
  const { userAlloc, optimalAlloc, user, optimal } = result;
  const bullets: string[] = [];
  let optimalMechanism = "";

  // Check for over-hedging (too much FI or structured buffer)
  if (userAlloc.fi > optimalAlloc.fi + 0.1 || userAlloc.struct > optimalAlloc.struct + 0.15) {
    const excessProtection = userAlloc.fi > optimalAlloc.fi + 0.1 ? "fixed income" : "structured protection";
    bullets.push(
      `You overpaid for protection (excess ${excessProtection}) and gave up upside participation in a strong market.`
    );
  }

  // Check equity note terms (cap/participation)
  if (userAlloc.equityNote.cap !== null && optimalAlloc.equityNote.cap === null) {
    bullets.push(
      `Your structured equity leg was capped at ${(userAlloc.equityNote.cap! * 100).toFixed(0)}%, truncating right-tail participation when uncapped exposure would have captured more upside.`
    );
  } else if (
    userAlloc.equityNote.cap !== null &&
    optimalAlloc.equityNote.cap !== null &&
    userAlloc.equityNote.cap < optimalAlloc.equityNote.cap
  ) {
    bullets.push(
      `Your structured equity cap (${(userAlloc.equityNote.cap! * 100).toFixed(0)}%) was too tight relative to optimal (${(optimalAlloc.equityNote.cap! * 100).toFixed(0)}%), limiting upside capture.`
    );
  }

  // Check equity weight vs optimal
  if (userAlloc.eq < optimalAlloc.eq - 0.15) {
    bullets.push(
      `You ran ${(userAlloc.eq * 100).toFixed(0)}% equity exposure versus ${(optimalAlloc.eq * 100).toFixed(0)}% optimal; in a strong market, optimal maintained higher delta exposure while keeping drawdown budget controlled.`
    );
  }

  // Check participation if both use equity notes
  if (userAlloc.struct > 0.2 && optimalAlloc.struct > 0.2) {
    if (userAlloc.equityNote.participation < optimalAlloc.equityNote.participation - 0.1) {
      bullets.push(
        `Optimal used higher participation (${(optimalAlloc.equityNote.participation * 100).toFixed(0)}% vs ${(userAlloc.equityNote.participation * 100).toFixed(0)}%) to capture more of the equity upside.`
      );
    }
  }

  // Generate optimal mechanism
  if (optimalAlloc.eq > userAlloc.eq + 0.1) {
    optimalMechanism = `Optimal maintained higher equity delta (${(optimalAlloc.eq * 100).toFixed(0)}% vs ${(userAlloc.eq * 100).toFixed(0)}%) to capture upside while using structured buffers to control tail risk.`;
  } else if (optimalAlloc.struct > userAlloc.struct + 0.1 && optimalAlloc.equityNote.cap === null) {
    optimalMechanism = `Optimal used uncapped structured equity exposure with higher participation to capture upside convexity while limiting downside.`;
  } else {
    optimalMechanism = `Optimal balanced equity exposure with defined-outcome structures, capturing upside while maintaining risk control.`;
  }

  // Default if no specific issues found
  if (bullets.length === 0) {
    bullets.push(
      `Optimal allocation captured ${(diffs.gap * 100).toFixed(1)} percentage points more return through better balance of upside participation and risk control.`
    );
  }

  return {
    headline: "Opportunity Missed: Upside Capture",
    bullets,
    optimalMechanism,
  };
}

function diagnosticsLevel2(
  result: LevelResult,
  diffs: { eqDiff: number; fiDiff: number; structDiff: number; ddDiff: number; gap: number }
): Diagnostics {
  const { userAlloc, optimalAlloc, user, optimal } = result;
  const bullets: string[] = [];
  let optimalMechanism = "";

  // Check for too much unhedged equity in mild drawdown
  if (userAlloc.eq > optimalAlloc.eq + 0.2 && userAlloc.struct < optimalAlloc.struct - 0.15) {
    bullets.push(
      `You held ${(userAlloc.eq * 100).toFixed(0)}% unhedged equity exposure into a mild drawdown; optimal used ${(optimalAlloc.struct * 100).toFixed(0)}% structured buffer exposure, converting small losses into flat outcomes.`
    );
  }

  // Check buffer effectiveness
  if (userAlloc.struct > 0.2 && optimalAlloc.struct > userAlloc.struct + 0.1) {
    const userBuffer = userAlloc.equityNote.buffer;
    const optBuffer = optimalAlloc.equityNote.buffer;
    if (result.regime.equityReturn >= -userBuffer && result.regime.equityReturn < -0.02) {
      // Buffer would have worked but user didn't have enough
      bullets.push(
        `In a -${(Math.abs(result.regime.equityReturn) * 100).toFixed(0)}% drawdown, optimal increased buffer exposure (${(optimalAlloc.struct * 100).toFixed(0)}% vs ${(userAlloc.struct * 100).toFixed(0)}%) to convert losses into flat outcomes.`
      );
    }
  }

  // Check income note utilization
  if (
    userAlloc.struct > 0.1 &&
    optimalAlloc.struct > userAlloc.struct &&
    optimalAlloc.structSplitEquityNote < userAlloc.structSplitEquityNote - 0.2
  ) {
    // Optimal used more income notes
    const userIncomeWeight = userAlloc.struct * (1 - userAlloc.structSplitEquityNote);
    const optIncomeWeight = optimalAlloc.struct * (1 - optimalAlloc.structSplitEquityNote);
    bullets.push(
      `You underutilized carry (${(userIncomeWeight * 100).toFixed(0)}% income note exposure); optimal harvested ${(optimal.income * 100).toFixed(2)}% income via structured notes when drawdown remained above barrier, capturing yield without taking barrier risk.`
    );
  }

  // Check barrier positioning for income notes
  if (userAlloc.struct > 0.2 && userAlloc.structSplitEquityNote < 0.5) {
    const userBarrier = userAlloc.incomeNote.barrier;
    const optBarrier = optimalAlloc.incomeNote.barrier;
    const equityLoss = -result.regime.equityReturn; // 0.05 = 5% loss
    const barrierLoss = (1 - userBarrier); // e.g., 0.3 for 70% barrier

    if (equityLoss < barrierLoss && optBarrier > userBarrier + 0.05) {
      // Market didn't breach, optimal used higher barrier (more coupon, safer)
      bullets.push(
        `Optimal increased defined-outcome exposure with higher barrier protection (${(optBarrier * 100).toFixed(0)}% vs ${(userBarrier * 100).toFixed(0)}%), reducing loss while preserving reinvestment flexibility.`
      );
    }
  }

  // Default if no specific issues
  if (bullets.length === 0) {
    bullets.push(
      `Optimal allocation reduced loss by ${(Math.abs(diffs.ddDiff) * 100).toFixed(1)} percentage points through better use of buffer structures and defined-outcome exposure in a mild drawdown environment.`
    );
  }

  // Optimal mechanism
  if (optimalAlloc.struct > userAlloc.struct + 0.15) {
    optimalMechanism = `Optimal increased defined-outcome exposure (${(optimalAlloc.struct * 100).toFixed(0)}% vs ${(userAlloc.struct * 100).toFixed(0)}%), using buffers to convert small losses into flat outcomes while harvesting carry.`;
  } else {
    optimalMechanism = `Optimal balanced buffer protection with carry generation, reducing drawdown while maintaining income.`;
  }

  return {
    headline: "Opportunity Missed: Mild Drawdown Management",
    bullets,
    optimalMechanism,
  };
}

function diagnosticsLevel3(
  result: LevelResult,
  diffs: { eqDiff: number; fiDiff: number; structDiff: number; ddDiff: number; gap: number }
): Diagnostics {
  const { userAlloc, optimalAlloc, user, optimal } = result;
  const bullets: string[] = [];
  let optimalMechanism = "";

  // Check for naive diversification (high EQ + FI mix)
  if (userAlloc.eq > 0.3 && userAlloc.fi > 0.3 && userAlloc.struct < 0.2) {
    bullets.push(
      `Diversification failed: your ${(userAlloc.eq * 100).toFixed(0)}% equity + ${(userAlloc.fi * 100).toFixed(0)}% fixed income mix suffered correlation convergence (both declined); naive EQ+FI diversification didn't control tail loss in extreme stress.`
    );
  }

  // Check barrier breach risk for income notes
  if (userAlloc.struct > 0.2 && userAlloc.structSplitEquityNote < 0.6) {
    // User has income note exposure
    const userBarrier = userAlloc.incomeNote.barrier;
    const equityLoss = -result.regime.equityReturn; // 0.30 = 30% loss
    const barrierLoss = 1 - userBarrier; // e.g., 0.3 for 70% barrier

    if (equityLoss >= barrierLoss) {
      // Barrier was breached
      const optBarrier = optimalAlloc.incomeNote.barrier;
      if (optBarrier > userBarrier + 0.05 || optimalAlloc.structSplitEquityNote > userAlloc.structSplitEquityNote + 0.2) {
        bullets.push(
          `Your income note exposure (${(userBarrier * 100).toFixed(0)}% barrier) was breached in a -${(equityLoss * 100).toFixed(0)}% drawdown; once breached, principal participates in the drawdown. Optimal reduced barrier risk or shifted to equity-linked structures.`
        );
      } else {
        bullets.push(
          `Your income note barrier (${(userBarrier * 100).toFixed(0)}%) was breached; optimal reduced structured concentration or used higher barriers to limit principal exposure.`
        );
      }
    }
  }

  // Check structured concentration
  if (userAlloc.struct > optimalAlloc.struct + 0.15 && userAlloc.structSplitEquityNote < 0.5) {
    // User has too much structured, and it's income-heavy
    bullets.push(
      `You over-concentrated in structured notes (${(userAlloc.struct * 100).toFixed(0)}% vs ${(optimalAlloc.struct * 100).toFixed(0)}% optimal), with too much exposure to coupon-paying structures that took principal hits when barriers breached.`
    );
  }

  // Check buffer vs barrier strategy
  if (
    userAlloc.struct > 0.2 &&
    userAlloc.structSplitEquityNote < optimalAlloc.structSplitEquityNote - 0.2
  ) {
    // User used more income notes, optimal used more equity-linked
    bullets.push(
      `Optimal shifted from 'coupon-first' to 'principal-first': used higher buffer equity-linked exposure (${(optimalAlloc.struct * optimalAlloc.structSplitEquityNote * 100).toFixed(0)}% vs ${(userAlloc.struct * userAlloc.structSplitEquityNote * 100).toFixed(0)}%) with lower barrier risk, preserving capital more effectively.`
    );
  }

  // Check buffer size
  if (userAlloc.struct > 0.2 && optimalAlloc.struct > 0.2) {
    const userBuffer = userAlloc.equityNote.buffer;
    const optBuffer = optimalAlloc.equityNote.buffer;
    if (optBuffer > userBuffer + 0.05) {
      bullets.push(
        `Optimal used larger buffers (${(optBuffer * 100).toFixed(0)}% vs ${(userBuffer * 100).toFixed(0)}%) to better protect principal in extreme stress.`
      );
    }
  }

  // Default
  if (bullets.length === 0) {
    bullets.push(
      `Optimal allocation preserved ${(Math.abs(diffs.ddDiff) * 100).toFixed(1)} percentage points more capital through better structured outcome design and reduced barrier breach risk.`
    );
  }

  // Optimal mechanism
  if (optimalAlloc.struct > userAlloc.struct + 0.1) {
    optimalMechanism = `Optimal increased buffer-protected exposure (${(optimalAlloc.struct * 100).toFixed(0)}% vs ${(userAlloc.struct * 100).toFixed(0)}%) with higher barriers and lower concentration, preserving capital when correlations break.`;
  } else if (optimalAlloc.structSplitEquityNote > userAlloc.structSplitEquityNote + 0.2) {
    optimalMechanism = `Optimal shifted to principal-first structures (higher buffer equity-linked exposure) rather than coupon-first (income notes), better protecting capital in tail scenarios.`;
  } else {
    optimalMechanism = `Optimal used disciplined structured exposure with appropriate barriers and buffers to control tail risk when diversification fails.`;
  }

  return {
    headline: "Opportunity Missed: Tail Risk Control",
    bullets,
    optimalMechanism,
  };
}

