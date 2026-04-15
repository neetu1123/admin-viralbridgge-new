'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Nov', earned: 820, withdrawn: 500 },
  { month: 'Dec', earned: 1450, withdrawn: 1000 },
  { month: 'Jan', earned: 1100, withdrawn: 800 },
  { month: 'Feb', earned: 2200, withdrawn: 1500 },
  { month: 'Mar', earned: 1750, withdrawn: 1000 },
  { month: 'Apr', earned: 3100, withdrawn: 500 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-md px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-600 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={`wtt-${p.name}`} className="text-xs text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name === 'earned' ? 'Earned' : 'Withdrawn'}: <strong>${p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function WalletChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="earned" fill="#7C3AED" radius={[4, 4, 0, 0]} />
        <Bar dataKey="withdrawn" fill="#e2d9fb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}