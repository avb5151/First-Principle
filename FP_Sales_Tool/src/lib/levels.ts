export type LevelId = 1 | 2 | 3;

export type Regime = {
  id: LevelId;
  name: string;
  subtitle: string;
  equityReturn: number; // e.g. 0.10
  bondReturn: number;   // e.g. 0.02
  stress: number;       // 0..1, used for "correlation break"
  description: string;
};

export const LEVELS: Regime[] = [
  {
    id: 1,
    name: "Level 1 — Comfort Zone",
    subtitle: "Market +10%",
    equityReturn: 0.10,
    bondReturn: 0.02,
    stress: 0.1,
    description: "Strong markets favor growth. Traditional allocations feel safe."
  },
  {
    id: 2,
    name: "Level 2 — False Safety",
    subtitle: "Market –5%",
    equityReturn: -0.05,
    bondReturn: 0.01,
    stress: 0.4,
    description: "Moderate drawdowns test diversification. Bonds partially compensate."
  },
  {
    id: 3,
    name: "Level 3 — Regime Break",
    subtitle: "Market –30%",
    equityReturn: -0.30,
    bondReturn: 0.00,
    stress: 0.9,
    description: "Extreme stress breaks correlations. Only engineered outcomes survive."
  },
];

