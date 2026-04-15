'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Nov', gmv: 18200 },
  { month: 'Dec', gmv: 24600 },
  { month: 'Jan', gmv: 19800 },
  { month: 'Feb', gmv: 31200 },
  { month: 'Mar', gmv: 28900 },
  { month: 'Apr', gmv: 25500 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-md px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-bold text-violet-700">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export default function AdminGMVChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradGMV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="gmv" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gradGMV)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}