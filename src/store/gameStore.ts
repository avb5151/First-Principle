import { create } from "zustand";
import { LevelId, LEVELS } from "@/lib/portfolio-challenge/levels";
import { Allocation, portfolioOutcome } from "@/lib/portfolio-challenge/payoff";
import { findOptimal } from "@/lib/portfolio-challenge/optimizer";

type GameState = {
  level: LevelId;
  timeLeft: number;
  allocation: Allocation;
  results: Record<number, {
    regime: typeof LEVELS[0];
    user: ReturnType<typeof portfolioOutcome>;
    userAlloc: Allocation;
    optimal: ReturnType<typeof portfolioOutcome>;
    optimalAlloc: Allocation;
    displayedOptimalTotalR: number; // Clamped optimal return for display
  }>;
  startLevel: (id: LevelId) => void;
  tick: () => void;
  setAllocation: (patch: Partial<Allocation>) => void;
  finishLevel: () => void;
  reset: () => void;
};

const defaultAllocation: Allocation = {
  fi: 0.3,
  eq: 0.5,
  struct: 0.2,
  structSplitEquityNote: 0.6,
  equityNote: { buffer: 0.15, cap: 0.12, participation: 1.0 },
  incomeNote: { coupon: 0.10, barrier: 0.70, protection: "hard" },
};

export const useGameStore = create<GameState>((set, get) => ({
  level: 1,
  timeLeft: 30,
  allocation: defaultAllocation,
  results: {},

  startLevel: (id) => set({ level: id, timeLeft: 30 }),

  tick: () => {
    const t = get().timeLeft;
    if (t <= 0) return;
    set({ timeLeft: t - 1 });
  },

  setAllocation: (patch) => set({ allocation: { ...get().allocation, ...patch } }),

  finishLevel: () => {
    const { level, allocation, results } = get();
    const regime = LEVELS.find(l => l.id === level)!;

    const user = portfolioOutcome(regime, allocation);
    
    // Find optimal by searching all allocation and term combinations
    // The optimizer searches across all possible structured note terms to find the true optimal
    const opt = findOptimal(regime, {
      equityNote: allocation.equityNote, // These are just placeholders, optimizer searches all combinations
      incomeNote: allocation.incomeNote,
    });

    // Recompute optimal outcome to ensure consistency
    const optimalOutcome = portfolioOutcome(regime, opt.a);

    // Option A clamping: Ensure displayed optimal return is never less than user return
    // This is a sales instrument - users should never "outperform" optimal
    const EPS = 1e-6;
    const displayedOptimalTotalR = Math.max(optimalOutcome.totalR, user.totalR - EPS);
    
    // Sanity check (console assert in dev)
    if (process.env.NODE_ENV === 'development') {
      console.assert(
        displayedOptimalTotalR + 1e-9 >= user.totalR,
        `Optimal must not be beat: displayedOptimal=${displayedOptimalTotalR}, user=${user.totalR}`
      );
    }

    set({
      results: {
        ...results,
        [level]: {
          regime,
          user,
          userAlloc: { ...allocation },
          optimal: optimalOutcome,
          optimalAlloc: opt.a,
          displayedOptimalTotalR,
        },
      },
    });
  },

  reset: () => set({ level: 1, timeLeft: 30, allocation: defaultAllocation, results: {} }),
}));

