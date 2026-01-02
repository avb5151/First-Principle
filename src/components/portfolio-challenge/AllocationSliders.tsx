"use client";
import { Allocation } from "@/lib/portfolio-challenge/payoff";
import { motion } from "framer-motion";

interface AllocationSlidersProps {
  allocation: Allocation;
  onChange: (patch: Partial<Allocation>) => void;
}

export default function AllocationSliders({ allocation, onChange }: AllocationSlidersProps) {
  const { fi, eq, struct } = allocation;
  const total = fi + eq + struct;
  const normalized = total > 0 ? { fi: fi / total, eq: eq / total, struct: struct / total } : { fi: 0, eq: 0, struct: 0 };

  const updateAllocation = (key: "fi" | "eq" | "struct", value: number) => {
    const newAllocation = { ...allocation };
    const clampedValue = Math.max(0, Math.min(1, value));
    const currentValue = allocation[key];
    const diff = clampedValue - currentValue;

    // Get other keys
    const otherKeys: Array<"fi" | "eq" | "struct"> = 
      key === "fi" ? ["eq", "struct"] : key === "eq" ? ["fi", "struct"] : ["fi", "eq"];
    
    // Calculate total of other allocations
    const otherTotal = otherKeys.reduce((sum, k) => sum + allocation[k], 0);

    // Set the new value
    newAllocation[key] = clampedValue;

    // If other total is 0 and we're trying to reduce, we can't
    if (otherTotal === 0 && diff < 0) {
      return; // Can't go below 0
    }

    // Adjust other allocations proportionally to maintain sum = 1
    if (otherTotal > 0) {
      const newOtherTotal = 1 - clampedValue;
      const scale = newOtherTotal / otherTotal;
      
      otherKeys.forEach(k => {
        newAllocation[k] = allocation[k] * scale;
      });
    } else {
      // If other total was 0, we're setting this to the full allocation
      otherKeys.forEach(k => {
        newAllocation[k] = 0;
      });
    }

    // Final normalization to ensure exact sum = 1 (handles floating point errors)
    const finalTotal = newAllocation.fi + newAllocation.eq + newAllocation.struct;
    if (Math.abs(finalTotal - 1) > 0.0001 && finalTotal > 0) {
      newAllocation.fi /= finalTotal;
      newAllocation.eq /= finalTotal;
      newAllocation.struct /= finalTotal;
    }

    onChange(newAllocation);
  };

  const Slider = ({ label, value, onChange: handleChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="text-sm tabular-nums text-white/60">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: 2px solid #000;
          }
          .slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: 2px solid #000;
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
          <div className={`text-sm tabular-nums ${Math.abs(total - 1) < 0.01 ? "text-white/60" : "text-red-400"}`}>
            Total: {(total * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="space-y-5">
          <Slider
            label="Fixed Income"
            value={fi}
            onChange={(v) => updateAllocation("fi", v)}
            color="#3b82f6"
          />
          <Slider
            label="Equities (EQUI Index)"
            value={eq}
            onChange={(v) => updateAllocation("eq", v)}
            color="#10b981"
          />
          <Slider
            label="Structured Strategies"
            value={struct}
            onChange={(v) => updateAllocation("struct", v)}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Visual allocation bar */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {fi > 0 && (
            <motion.div
              initial={false}
              animate={{ width: `${normalized.fi * 100}%` }}
              className="bg-blue-500"
              transition={{ duration: 0.2 }}
            />
          )}
          {eq > 0 && (
            <motion.div
              initial={false}
              animate={{ width: `${normalized.eq * 100}%` }}
              className="bg-green-500"
              transition={{ duration: 0.2 }}
            />
          )}
          {struct > 0 && (
            <motion.div
              initial={false}
              animate={{ width: `${normalized.struct * 100}%` }}
              className="bg-amber-500"
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

