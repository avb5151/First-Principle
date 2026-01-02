"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Allocation, EquityNoteTerms, IncomeNoteTerms } from "@/lib/portfolio-challenge/payoff";

interface StructuredTogglesProps {
  allocation: Allocation;
  onChange: (patch: Partial<Allocation>) => void;
}

export default function StructuredToggles({ allocation, onChange }: StructuredTogglesProps) {
  const updateEquityNote = (patch: Partial<EquityNoteTerms>) => {
    onChange({
      equityNote: { ...allocation.equityNote, ...patch },
    });
  };

  const updateIncomeNote = (patch: Partial<IncomeNoteTerms>) => {
    onChange({
      incomeNote: { ...allocation.incomeNote, ...patch },
    });
  };

  const updateStructSplit = (split: number) => {
    onChange({ structSplitEquityNote: split });
  };

  const ToggleGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white/80">{label}</div>
      {children}
    </div>
  );

  // Slidable toggle group for numeric values
  const SlidableToggleGroup = ({
    options,
    value,
    onChange: handleChange,
    format,
  }: {
    options: number[];
    value: number;
    onChange: (v: number) => void;
    format?: (v: number) => string;
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const startValueRef = useRef<number>(0);

    const findClosestOption = useCallback((x: number, width: number) => {
      const ratio = Math.max(0, Math.min(1, x / width));
      const index = Math.round(ratio * (options.length - 1));
      return options[index];
    }, [options]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      setIsDragging(true);
      startXRef.current = e.clientX;
      startValueRef.current = value;
      e.preventDefault();
    }, [value]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newValue = findClosestOption(x, rect.width);
      
      if (newValue !== value) {
        handleChange(newValue);
      }
    }, [isDragging, value, handleChange, findClosestOption]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Attach global mouse events
    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const currentIndex = options.indexOf(value);
    const progress = currentIndex >= 0 ? currentIndex / (options.length - 1) : 0;

    return (
      <div className="relative">
        {/* Slider track */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          className="relative h-10 bg-white/10 rounded-lg cursor-pointer select-none"
        >
          {/* Active segment */}
          <div
            className="absolute h-full bg-white/20 rounded-lg transition-all duration-150"
            style={{ width: `${(progress * 100)}%` }}
          />
          
          {/* Option markers */}
          <div className="absolute inset-0 flex items-center">
            {options.map((opt, idx) => {
              const position = (idx / (options.length - 1)) * 100;
              const isActive = opt === value;
              return (
                <div
                  key={opt}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? 'bg-white scale-150' : 'bg-white/40'
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChange(opt);
                    }}
                    className={`mt-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {format ? format(opt) : String(opt)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ButtonGroup = <T extends string | number | null>({
    options,
    value,
    onChange: handleChange,
    format,
  }: {
    options: T[];
    value: T;
    onChange: (v: T) => void;
    format?: (v: T) => string;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt)}
          onClick={() => handleChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === opt
              ? "bg-white text-black"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          {format ? format(opt) : String(opt)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-white/80 mb-3">Structured Strategy Mix</div>
        <SlidableToggleGroup
          options={[0.0, 0.5, 1.0]}
          value={
            allocation.structSplitEquityNote >= 0.9
              ? 1.0
              : allocation.structSplitEquityNote >= 0.4 && allocation.structSplitEquityNote <= 0.6
              ? 0.5
              : 0.0
          }
          onChange={(v) => updateStructSplit(v)}
          format={(v) => {
            if (v === 1.0) return "Equity-Linked";
            if (v === 0.5) return "Balanced";
            return "Income-Focused";
          }}
        />
      </div>

      <ToggleGroup label="Equity-Linked Note Terms">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-white/60 mb-2">Buffer</div>
            <SlidableToggleGroup
              options={[0.10, 0.15, 0.20, 0.30]}
              value={allocation.equityNote.buffer}
              onChange={(v) => updateEquityNote({ buffer: v })}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">Cap</div>
            <ButtonGroup
              options={[0.08, 0.10, 0.12, 0.15, null]}
              value={allocation.equityNote.cap}
              onChange={(v) => updateEquityNote({ cap: v })}
              format={(v) => (v === null ? "Uncapped" : `${(v * 100).toFixed(0)}%`)}
            />
          </div>
        </div>
      </ToggleGroup>

      <ToggleGroup label="Income Note Terms">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-white/60 mb-2">Coupon Rate</div>
            <SlidableToggleGroup
              options={[0.06, 0.08, 0.10, 0.12]}
              value={allocation.incomeNote.coupon}
              onChange={(v) => updateIncomeNote({ coupon: v })}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">Barrier</div>
            <SlidableToggleGroup
              options={[0.60, 0.70, 0.80]}
              value={allocation.incomeNote.barrier}
              onChange={(v) => updateIncomeNote({ barrier: v })}
              format={(v) => `${(v * 100).toFixed(0)}%`}
            />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-2">Protection Type</div>
            <ButtonGroup
              options={["hard", "soft"]}
              value={allocation.incomeNote.protection}
              onChange={(v) => updateIncomeNote({ protection: v })}
              format={(v) => (v === "hard" ? "Hard" : "Soft")}
            />
          </div>
        </div>
      </ToggleGroup>
    </div>
  );
}

