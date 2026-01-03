import { MarketEnvironment } from "./levels";

export type Scenario = {
  equityReturn: number;
  bondReturn: number;
};

// Deterministic RNG with seed
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple LCG
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }

  // Box-Muller for normal distribution
  normal(mean: number, stdDev: number): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}

export function generateScenarios(environment: MarketEnvironment, nScenarios: number = 50): Scenario[] {
  // Fixed seed per level for determinism
  const seed = 12345 + environment.id * 1000;
  const rng = new SeededRNG(seed);

  const scenarios: Scenario[] = [];

  // Sigma by level (volatility around anchor)
  const sigmaByLevel: Record<1 | 2 | 3, number> = {
    1: 0.08,  // Level 1: lower volatility around +10%
    2: 0.10,  // Level 2: moderate volatility around -5%
    3: 0.16,  // Level 3: higher volatility around -30%
  };

  const sigma = sigmaByLevel[environment.id];

  for (let i = 0; i < nScenarios; i++) {
    // Generate equity return: Normal(mu=environment.equityReturn, sigma) truncated to [-0.6, +0.3]
    let rEq = environment.equityReturn + rng.normal(0, sigma);
    
    // Truncate to realistic bounds
    rEq = Math.max(-0.60, Math.min(0.30, rEq));

    // Generate bond return with correlation and correlation-break
    // Base return plus noise, but in stress (high stress), bonds suffer when equity crashes
    const baseBondReturn = environment.bondReturn;
    const bondNoise = rng.normal(0, 0.01); // Small noise
    const correlationBreakTerm = environment.stress * 0.25 * Math.min(0, rEq); // Negative when equity crashes
    
    let rFi = baseBondReturn + bondNoise + correlationBreakTerm;
    // Bond returns typically bounded: can't go too negative, but can have small negative in stress
    rFi = Math.max(-0.10, Math.min(0.05, rFi));

    scenarios.push({
      equityReturn: rEq,
      bondReturn: rFi,
    });
  }

  return scenarios;
}

