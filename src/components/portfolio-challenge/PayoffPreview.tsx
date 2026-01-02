"use client";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Allocation, portfolioOutcome } from "@/lib/portfolio-challenge/payoff";
import { Regime, LEVELS } from "@/lib/portfolio-challenge/levels";

interface PayoffPreviewProps {
  allocation: Allocation;
  currentRegime?: Regime;
}

export default function PayoffPreview({ allocation, currentRegime }: PayoffPreviewProps) {
  // Generate payoff curve data for different equity return scenarios
  const { data, yDomain } = useMemo(() => {
    const scenarios = [];
    const portfolioReturns: number[] = [];
    
    for (let eqReturn = -0.40; eqReturn <= 0.20; eqReturn += 0.02) {
      // Create a synthetic regime for this scenario
      const syntheticRegime: Regime = {
        id: 1,
        name: "Synthetic",
        subtitle: "",
        equityReturn: eqReturn,
        bondReturn: 0.02,
        stress: eqReturn < -0.20 ? 0.9 : eqReturn < -0.05 ? 0.4 : 0.1,
        description: "",
      };

      const outcome = portfolioOutcome(syntheticRegime, allocation);
      const portfolioReturn = outcome.totalR * 100;
      portfolioReturns.push(portfolioReturn);
      
      scenarios.push({
        equityReturn: eqReturn * 100,
        portfolioReturn,
        maxDrawdown: outcome.maxDD * 100,
      });
    }
    
    // Calculate Y-axis domain with padding
    const minReturn = Math.min(...portfolioReturns);
    const maxReturn = Math.max(...portfolioReturns);
    const padding = Math.max(5, (maxReturn - minReturn) * 0.1);
    const yMin = Math.floor(minReturn - padding);
    const yMax = Math.ceil(maxReturn + padding);
    
    return {
      data: scenarios,
      yDomain: [yMin, yMax],
    };
  }, [allocation]);

  const currentOutcome = currentRegime ? portfolioOutcome(currentRegime, allocation) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Payoff Profile</h3>
        {currentOutcome && (
          <div className="text-sm tabular-nums text-white/60">
            Current: <span className="text-white font-medium">{(currentOutcome.totalR * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="h-72 bg-black/40 rounded-xl border border-white/5 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="equityReturn"
              type="number"
              domain={[-40, 20]}
              ticks={[-40, -30, -20, -10, 0, 10, 20]}
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              tickFormatter={(value) => `${value}%`}
              label={{ 
                value: "Equity Return (%)", 
                position: "insideBottom", 
                offset: -8, 
                fill: "rgba(255,255,255,0.5)",
                style: { fontSize: "12px" }
              }}
            />
            <YAxis
              type="number"
              domain={yDomain}
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              tickFormatter={(value) => {
                // Format with no decimals for whole numbers, one decimal otherwise
                if (value % 1 === 0) return `${value}%`;
                return `${value.toFixed(1)}%`;
              }}
              label={{ 
                value: "Portfolio Return (%)", 
                angle: -90, 
                position: "insideLeft", 
                fill: "rgba(255,255,255,0.5)",
                style: { fontSize: "12px" }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.95)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px 12px",
              }}
              formatter={(value: number) => {
                const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
                return [`${formatted}%`, "Portfolio Return"];
              }}
              labelFormatter={(label) => {
                const equityVal = parseFloat(label);
                const formatted = equityVal % 1 === 0 ? equityVal.toFixed(0) : equityVal.toFixed(1);
                return `Equity: ${formatted}%`;
              }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" strokeWidth={1} />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" strokeWidth={1} />
            {currentRegime && (
              <ReferenceLine
                x={currentRegime.equityReturn * 100}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{ 
                  value: "Current Regime", 
                  position: "top", 
                  fill: "rgba(255,255,255,0.7)",
                  style: { fontSize: "11px" }
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="portfolioReturn"
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#ffffff", strokeWidth: 2, stroke: "#000" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1.5">Expected Return</div>
          <div className={`text-2xl font-semibold tabular-nums ${currentOutcome && currentOutcome.totalR >= 0 ? "text-white" : "text-red-400"}`}>
            {currentOutcome ? `${(currentOutcome.totalR * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1.5">Max Drawdown</div>
          <div className="text-2xl font-semibold tabular-nums text-white">
            {currentOutcome ? `${(currentOutcome.maxDD * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1.5">Income Generated</div>
          <div className="text-2xl font-semibold tabular-nums text-white">
            {currentOutcome ? `${(currentOutcome.income * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

