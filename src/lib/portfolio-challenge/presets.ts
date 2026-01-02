import { Allocation, EquityNoteTerms, IncomeNoteTerms } from "./payoff";

export type Profile = "income" | "balanced" | "equity";

export type IncomeControlState = {
  incomeTarget: "low" | "med" | "high";
  protection: "conservative" | "standard";
};

export type BalancedControlState = {
  tilt: "income" | "neutral" | "growth";
  protectionLevel: 10 | 15 | 20;
};

export type EquityControlState = {
  upside: "conservative" | "standard" | "high";
  buffer: 10 | 15 | 20;
};

export type ProfileControlState = 
  | { profile: "income"; controls: IncomeControlState }
  | { profile: "balanced"; controls: BalancedControlState }
  | { profile: "equity"; controls: EquityControlState };

// Convert profile + controls to actual allocation terms
export function profileToAllocation(
  profileState: ProfileControlState,
  currentAllocation: Allocation
): Partial<Allocation> {
  const { profile, controls } = profileState;

  if (profile === "income") {
    const { incomeTarget, protection } = controls as IncomeControlState;
    
    // Income-focused: mostly income notes, minimal equity-linked
    const structSplitEquityNote = 0.1; // 10% equity, 90% income
    
    // Income note terms based on target and protection
    const incomeNote: IncomeNoteTerms = {
      coupon: incomeTarget === "high" ? 0.12 : incomeTarget === "med" ? 0.10 : 0.08,
      barrier: protection === "conservative" ? 0.80 : 0.70,
      protection: protection === "conservative" ? "hard" : "hard",
    };
    
    // Minimal equity note (just for the 10% split)
    const equityNote: EquityNoteTerms = {
      buffer: 0.20, // Conservative buffer
      cap: 0.10, // Capped upside
      participation: 1.0,
    };
    
    return {
      structSplitEquityNote,
      incomeNote,
      equityNote,
    };
  }

  if (profile === "balanced") {
    const { tilt, protectionLevel } = controls as BalancedControlState;
    
    // Balanced: 50/50 split, adjusted by tilt
    let structSplitEquityNote = 0.5;
    if (tilt === "income") structSplitEquityNote = 0.4; // 40% equity, 60% income
    if (tilt === "growth") structSplitEquityNote = 0.6; // 60% equity, 40% income
    
    // Income note with protection level
    const incomeNote: IncomeNoteTerms = {
      coupon: 0.10,
      barrier: protectionLevel === 20 ? 0.80 : protectionLevel === 15 ? 0.75 : 0.70,
      protection: "hard",
    };
    
    // Equity note with protection level as buffer
    const equityNote: EquityNoteTerms = {
      buffer: protectionLevel / 100, // 0.10, 0.15, or 0.20
      cap: tilt === "growth" ? null : 0.12, // Uncapped for growth tilt
      participation: 1.0,
    };
    
    return {
      structSplitEquityNote,
      incomeNote,
      equityNote,
    };
  }

  if (profile === "equity") {
    const { upside, buffer } = controls as EquityControlState;
    
    // Equity-focused: mostly equity-linked, minimal income
    const structSplitEquityNote = 0.85; // 85% equity, 15% income
    
    // Equity note terms based on upside and buffer
    const equityNote: EquityNoteTerms = {
      buffer: buffer / 100, // 0.10, 0.15, or 0.20
      cap: upside === "conservative" ? 0.12 : upside === "standard" ? 0.15 : null, // Uncapped for high upside
      participation: upside === "high" ? 1.0 : upside === "standard" ? 1.0 : 0.9,
    };
    
    // Minimal income note (just for the 15% split)
    const incomeNote: IncomeNoteTerms = {
      coupon: 0.08,
      barrier: 0.75, // Standard barrier
      protection: "hard",
    };
    
    return {
      structSplitEquityNote,
      incomeNote,
      equityNote,
    };
  }

  // Fallback (shouldn't happen)
  return {};
}

// Generate outcome summary text
export function getOutcomeSummary(profileState: ProfileControlState): string {
  const { profile, controls } = profileState;

  if (profile === "income") {
    const { incomeTarget, protection } = controls as IncomeControlState;
    const targetText = incomeTarget === "high" ? "high income" : incomeTarget === "med" ? "moderate income" : "stable income";
    const protectionText = protection === "conservative" ? "with conservative principal protection" : "with standard protection";
    return `Targets ${targetText} ${protectionText} through barrier-protected income structures.`;
  }

  if (profile === "balanced") {
    const { tilt, protectionLevel } = controls as BalancedControlState;
    const tiltText = tilt === "income" ? "income-oriented" : tilt === "growth" ? "growth-oriented" : "balanced";
    return `${tiltText.charAt(0).toUpperCase() + tiltText.slice(1)} allocation with ${protectionLevel}% downside buffer protection.`;
  }

  if (profile === "equity") {
    const { upside, buffer } = controls as EquityControlState;
    const upsideText = upside === "high" ? "uncapped upside participation" : upside === "standard" ? "standard upside" : "conservative upside";
    return `Focuses on ${upsideText} with ${buffer}% downside buffer protection.`;
  }

  return "";
}

