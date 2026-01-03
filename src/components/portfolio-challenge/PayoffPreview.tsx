"use client";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Allocation, portfolioOutcome } from "@/lib/portfolio-challenge/payoff";
import { MarketEnvironment, LEVELS } from "@/lib/portfolio-challenge/levels";

interface PayoffPreviewProps {
  allocation: Allocation;
  currentEnvironment?: MarketEnvironment;
  compact?: boolean;
}

export default function PayoffPreview({ allocation, currentEnvironment, compact = false }: PayoffPreviewProps) {
  // Generate payoff curve data for different equity return scenarios
  const { data, yDomain } = useMemo(() => {
    const scenarios = [];
    const portfolioReturns: number[] = [];
    
    for (let eqReturn = -0.40; eqReturn <= 0.20; eqReturn += 0.02) {
      // Create a synthetic market environment for this scenario
      const syntheticEnvironment: MarketEnvironment = {
        id: 1,
        name: "Synthetic",
        subtitle: "",
        equityReturn: eqReturn,
        bondReturn: 0.02,
        stress: eqReturn < -0.20 ? 0.9 : eqReturn < -0.05 ? 0.4 : 0.1,
        description: "",
      };

      const outcome = portfolioOutcome(syntheticEnvironment, allocation);
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
    const padding = compact 
      ? Math.max(2, (maxReturn - minReturn) * 0.06)
      : Math.max(5, (maxReturn - minReturn) * 0.1);
    const yMin = Math.floor(minReturn - padding);
    const yMax = Math.ceil(maxReturn + padding);
    
    return {
      data: scenarios,
      yDomain: [yMin, yMax],
    };
  }, [allocation, compact]);

  const currentOutcome = currentEnvironment ? portfolioOutcome(currentEnvironment, allocation) : null;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-base font-semibold text-white">Payoff Profile</h3>
        {currentOutcome && (
          <div className="text-xs tabular-nums text-white/60">
            Current: <span className="text-white font-medium">{(currentOutcome.totalR * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className={compact ? "flex-1 w-full h-full bg-black/30 rounded-lg" : "flex-1 min-h-0 bg-black/40 rounded-xl border border-white/5 p-4"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={compact ? { top: 6, right: 6, bottom: 6, left: 6 } : { top: 12, right: 18, bottom: 16, left: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={compact ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"} />
            <XAxis
              dataKey="equityReturn"
              type="number"
              domain={[-40, 20]}
              ticks={compact ? [-40, -20, 0, 20] : [-40, -30, -20, -10, 0, 10, 20]}
              stroke="rgba(255,255,255,0.3)"
              tick={compact 
                ? { fill: "rgba(255,255,255,0.5)", fontSize: 9, dy: 10 }
                : { fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              tickMargin={compact ? 0 : undefined}
              tickSize={compact ? 0 : undefined}
              tickLine={compact ? false : { stroke: "rgba(255,255,255,0.2)" }}
              axisLine={compact ? false : { stroke: "rgba(255,255,255,0.2)" }}
              tickFormatter={(value) => `${value}%`}
              label={compact ? undefined : { 
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
              tick={compact 
                ? { fill: "rgba(255,255,255,0.5)", fontSize: 9, dx: -10 }
                : { fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              tickMargin={compact ? 0 : undefined}
              tickSize={compact ? 0 : undefined}
              tickLine={compact ? false : { stroke: "rgba(255,255,255,0.2)" }}
              axisLine={compact ? false : { stroke: "rgba(255,255,255,0.2)" }}
              tickFormatter={(value) => {
                // Format with no decimals for whole numbers, one decimal otherwise
                if (value % 1 === 0) return `${value}%`;
                return `${value.toFixed(1)}%`;
              }}
              label={compact ? undefined : { 
                value: "Portfolio Outcome (%)", 
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
                return [`${formatted}%`, "Portfolio Outcome"];
              }}
              labelFormatter={(label) => {
                const equityVal = parseFloat(label);
                const formatted = equityVal % 1 === 0 ? equityVal.toFixed(0) : equityVal.toFixed(1);
                return `Equity: ${formatted}%`;
              }}
            />
            <ReferenceLine y={0} stroke={compact ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.2)"} strokeDasharray="2 2" strokeWidth={compact ? 1.5 : 1} />
            <ReferenceLine x={0} stroke={compact ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.2)"} strokeDasharray="2 2" strokeWidth={compact ? 1.5 : 1} />
            {currentEnvironment && (
              <ReferenceLine
                x={currentEnvironment.equityReturn * 100}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={compact ? undefined : { 
                  value: "Current Environment", 
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
    </div>
  );
}

// Separate component for metrics to be displayed on the right
export function PayoffMetrics({ allocation, currentEnvironment }: { allocation: Allocation; currentEnvironment?: MarketEnvironment }) {
  const currentOutcome = currentEnvironment ? portfolioOutcome(currentEnvironment, allocation) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white mb-4">Current Outcome</h3>
      <div className="space-y-3">
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Portfolio Outcome</div>
          <div className={`text-2xl font-semibold tabular-nums ${currentOutcome && currentOutcome.totalR >= 0 ? "text-white" : "text-red-400"}`}>
            {currentOutcome ? `${(currentOutcome.totalR * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Max Drawdown</div>
          <div className="text-2xl font-semibold tabular-nums text-white">
            {currentOutcome ? `${(currentOutcome.maxDD * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg border border-white/5 p-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Income Generated</div>
          <div className="text-2xl font-semibold tabular-nums text-white">
            {currentOutcome ? `${(currentOutcome.income * 100).toFixed(2)}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

