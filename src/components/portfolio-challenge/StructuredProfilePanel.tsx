"use client";
import React, { useState } from "react";
import { Allocation } from "@/lib/portfolio-challenge/payoff";
import { 
  Profile, 
  ProfileControlState, 
  IncomeControlState, 
  BalancedControlState, 
  EquityControlState,
  profileToAllocation,
  getOutcomeSummary 
} from "@/lib/portfolio-challenge/presets";
import { motion } from "framer-motion";

interface StructuredProfilePanelProps {
  allocation: Allocation;
  onChange: (patch: Partial<Allocation>) => void;
}

export default function StructuredProfilePanel({ allocation, onChange }: StructuredProfilePanelProps) {
  // Derive current profile from allocation
  const getCurrentProfile = (): Profile => {
    const split = allocation.structSplitEquityNote;
    if (split <= 0.2) return "income";
    if (split >= 0.7) return "equity";
    return "balanced";
  };

  const [profile, setProfile] = useState<Profile>(getCurrentProfile());
  
  // Derive current controls from allocation
  const getCurrentControls = (): ProfileControlState["controls"] => {
    if (profile === "income") {
      const coupon = allocation.incomeNote.coupon;
      const barrier = allocation.incomeNote.barrier;
      return {
        incomeTarget: coupon >= 0.11 ? "high" : coupon >= 0.09 ? "med" : "low",
        protection: barrier >= 0.75 ? "conservative" : "standard",
      } as IncomeControlState;
    }
    if (profile === "balanced") {
      const split = allocation.structSplitEquityNote;
      const buffer = allocation.equityNote.buffer;
      return {
        tilt: split <= 0.45 ? "income" : split >= 0.55 ? "growth" : "neutral",
        protectionLevel: buffer >= 0.175 ? 20 : buffer >= 0.125 ? 15 : 10,
      } as BalancedControlState;
    }
    // equity
    const buffer = allocation.equityNote.buffer;
    const cap = allocation.equityNote.cap;
    return {
      upside: cap === null ? "high" : cap >= 0.14 ? "standard" : "conservative",
      buffer: buffer >= 0.175 ? 20 : buffer >= 0.125 ? 15 : 10,
    } as EquityControlState;
  };

  const [controls, setControls] = useState<ProfileControlState["controls"]>(getCurrentControls());

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
    // Reset controls to defaults for new profile
    let defaultControls: ProfileControlState["controls"];
    if (newProfile === "income") {
      defaultControls = { incomeTarget: "med", protection: "standard" };
    } else if (newProfile === "balanced") {
      defaultControls = { tilt: "neutral", protectionLevel: 15 };
    } else {
      defaultControls = { upside: "standard", buffer: 15 };
    }
    setControls(defaultControls);
    
    // Apply the new profile
    const profileState: ProfileControlState = {
      profile: newProfile,
      controls: defaultControls,
    } as ProfileControlState;
    const allocationPatch = profileToAllocation(profileState, allocation);
    onChange(allocationPatch);
  };

  const updateControls = (patch: Partial<ProfileControlState["controls"]>) => {
    const newControls = { ...controls, ...patch };
    setControls(newControls);
    
    // Apply the updated profile
    const profileState: ProfileControlState = {
      profile,
      controls: newControls,
    } as ProfileControlState;
    const allocationPatch = profileToAllocation(profileState, allocation);
    onChange(allocationPatch);
  };

  const profileState: ProfileControlState = {
    profile,
    controls,
  } as ProfileControlState;

  const outcomeSummary = getOutcomeSummary(profileState);

  const profiles = [
    {
      id: "income" as Profile,
      title: "Income-Focused",
      description: "Maximize cash yield with principal protection",
    },
    {
      id: "balanced" as Profile,
      title: "Balanced",
      description: "Blend of income and growth with downside buffers",
    },
    {
      id: "equity" as Profile,
      title: "Equity-Linked",
      description: "Upside participation with defined downside protection",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Structured Strategy</h3>
        <p className="text-sm text-white/60 mb-6">
          Select a profile to engineer outcomes aligned with your objectives.
        </p>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {profiles.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => updateProfile(p.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                profile === p.id
                  ? "border-white/40 bg-white/5 shadow-lg shadow-white/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`text-sm font-medium mb-1 ${profile === p.id ? "text-white" : "text-white/70"}`}>
                {p.title}
              </div>
              <div className="text-xs text-white/50 leading-relaxed">
                {p.description}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Profile-Specific Controls */}
        <div className="space-y-5 pt-4 border-t border-white/10">
          {profile === "income" && (
            <>
              <div>
                <div className="text-sm text-white/70 mb-3">Income Target</div>
                <div className="flex gap-2">
                  {(["low", "med", "high"] as const).map((target) => (
                    <button
                      key={target}
                      onClick={() => updateControls({ incomeTarget: target })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as IncomeControlState).incomeTarget === target
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {target.charAt(0).toUpperCase() + target.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-3">Protection Level</div>
                <div className="flex gap-2">
                  {(["conservative", "standard"] as const).map((prot) => (
                    <button
                      key={prot}
                      onClick={() => updateControls({ protection: prot })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as IncomeControlState).protection === prot
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {prot.charAt(0).toUpperCase() + prot.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {profile === "balanced" && (
            <>
              <div>
                <div className="text-sm text-white/70 mb-3">Allocation Tilt</div>
                <div className="flex gap-2">
                  {(["income", "neutral", "growth"] as const).map((tilt) => (
                    <button
                      key={tilt}
                      onClick={() => updateControls({ tilt })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as BalancedControlState).tilt === tilt
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {tilt.charAt(0).toUpperCase() + tilt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-3">Downside Protection</div>
                <div className="flex gap-2">
                  {([10, 15, 20] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateControls({ protectionLevel: level })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as BalancedControlState).protectionLevel === level
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {profile === "equity" && (
            <>
              <div>
                <div className="text-sm text-white/70 mb-3">Upside Participation</div>
                <div className="flex gap-2">
                  {(["conservative", "standard", "high"] as const).map((upside) => (
                    <button
                      key={upside}
                      onClick={() => updateControls({ upside })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as EquityControlState).upside === upside
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {upside.charAt(0).toUpperCase() + upside.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/70 mb-3">Downside Buffer</div>
                <div className="flex gap-2">
                  {([10, 15, 20] as const).map((buffer) => (
                    <button
                      key={buffer}
                      onClick={() => updateControls({ buffer })}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        (controls as EquityControlState).buffer === buffer
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      {buffer}%
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Outcome Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2">Outcome Summary</div>
          <p className="text-sm text-white/80 leading-relaxed">{outcomeSummary}</p>
        </div>
      </div>
    </div>
  );
}

