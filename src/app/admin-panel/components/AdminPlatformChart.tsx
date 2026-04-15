'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { platform: 'Instagram', campaigns: 18, fill: '#EC4899' },
  { platform: 'YouTube',   campaigns: 12, fill: '#EF4444' },
  { platform: 'TikTok',    campaigns: 15, fill: '#1e293b' },
  { platform: 'Twitter',   campaigns: 4,  fill: '#0EA5E9' },
  { platform: 'LinkedIn',  campaigns: 3,  fill: '#3B82F6' },
  { platform: 'Pinterest', campaigns: 2,  fill: '#E11D48' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card-md px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{payload[0].value} campaigns</p>
    </div>
  );
};

export default function AdminPlatformChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="platform" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="campaigns" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-platform-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}