'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface AnalyticsDateRange {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
}

interface PeriodSelectorProps {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(value.period === 'custom');
  const presetOptions: Exclude<AnalyticsPeriod, 'custom'>[] = ['7d', '30d', '90d', '1y'];

  const handlePreset = (period: Exclude<AnalyticsPeriod, 'custom'>) => {
    setShowCustom(false);
    onChange({ period });
  };

  const handleCustomToggle = () => {
    setShowCustom(true);
    onChange({ period: 'custom', from: value.from ?? '', to: value.to ?? '' });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {presetOptions.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              value.period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={handleCustomToggle}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
            value.period === 'custom' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar size={12} />
          Custom
        </button>
      </div>

      {showCustom && value.period === 'custom' && (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <input
            type="date"
            value={value.from ?? ''}
            onChange={(e) => onChange({ period: 'custom', from: e.target.value, to: value.to })}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-700"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={value.to ?? ''}
            onChange={(e) => onChange({ period: 'custom', from: value.from, to: e.target.value })}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-700"
          />
        </div>
      )}
    </div>
  );
}

export function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
