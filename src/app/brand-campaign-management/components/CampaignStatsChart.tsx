'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mar 15', applications: 4, accepted: 1 },
  { date: 'Mar 18', applications: 7, accepted: 2 },
  { date: 'Mar 21', applications: 5, accepted: 1 },
  { date: 'Mar 24', applications: 12, accepted: 3 },
  { date: 'Mar 27', applications: 9, accepted: 2 },
  { date: 'Mar 30', applications: 15, accepted: 4 },
  { date: 'Apr 02', applications: 11, accepted: 3 },
  { date: 'Apr 05', applications: 18, accepted: 5 },
  { date: 'Apr 08', applications: 14, accepted: 4 },
  { date: 'Apr 11', applications: 22, accepted: 6 },
  { date: 'Apr 14', applications: 19, accepted: 5 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-md px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-600 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={`tt-${p.name}`} className="text-xs text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name === 'applications' ? 'Applications' : 'Accepted'}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function CampaignStatsChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradAccepted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="applications" stroke="#7C3AED" strokeWidth={2} fill="url(#gradApps)" />
        <Area type="monotone" dataKey="accepted" stroke="#10B981" strokeWidth={2} fill="url(#gradAccepted)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}