'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { SystemMetrics } from '@/types/schema';

interface SeverityDistributionChartProps {
  metrics: SystemMetrics;
  onSelectSeverity?: (severity: string) => void;
}

export function SeverityDistributionChart({ metrics, onSelectSeverity }: SeverityDistributionChartProps) {
  const { p1, p2, p3, p4 } = metrics.severityDistribution;
  const maxVal = Math.max(p1, p2, p3, p4, 1);

  const bars = [
    {
      level: 'P1',
      label: 'Critical',
      count: p1,
      barColor: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-red-600',
      heightPercent: Math.max((p1 / maxVal) * 100, 15),
    },
    {
      level: 'P2',
      label: 'High',
      count: p2,
      barColor: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-600',
      heightPercent: Math.max((p2 / maxVal) * 100, 15),
    },
    {
      level: 'P3',
      label: 'Moderate',
      count: p3,
      barColor: 'bg-amber-500 hover:bg-amber-600',
      textColor: 'text-amber-600',
      heightPercent: Math.max((p3 / maxVal) * 100, 15),
    },
    {
      level: 'P4',
      label: 'Low',
      count: p4,
      barColor: 'bg-slate-300 hover:bg-slate-400',
      textColor: 'text-slate-500',
      heightPercent: Math.max((p4 / maxVal) * 100, 15),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">
          Severity Distribution (Gemini Analysis)
        </h2>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-4 pb-2 px-2">
        <div className="grid grid-cols-4 gap-3 items-end h-32">
          {bars.map((bar) => (
            <div
              key={bar.level}
              onClick={() => onSelectSeverity && onSelectSeverity(bar.level)}
              className="flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              {/* Count on top of bar */}
              <span className="text-xs font-bold text-slate-800 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                {bar.count}
              </span>

              {/* Bar */}
              <div className="w-full bg-stone-100 rounded-t-lg h-24 flex items-end p-0.5 overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${bar.barColor}`}
                  style={{ height: `${bar.heightPercent}%` }}
                />
              </div>

              {/* Labels beneath */}
              <div className="text-center mt-2">
                <div className="text-[11px] font-bold text-slate-800">{bar.level}</div>
                <div className="text-[10px] text-slate-400 font-medium">{bar.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
