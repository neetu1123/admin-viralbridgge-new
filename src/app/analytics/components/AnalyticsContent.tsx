'use client';
import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, Users, Eye, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { downloadCsv } from '@/src/lib/exportCsv';

const spendData = [
  { month: 'Nov', spend: 3200, reachFactor: 2.1 },
  { month: 'Dec', spend: 5800, reachFactor: 2.8 },
  { month: 'Jan', spend: 4200, reachFactor: 2.4 },
  { month: 'Feb', spend: 6400, reachFactor: 3.2 },
  { month: 'Mar', spend: 7100, reachFactor: 2.9 },
  { month: 'Apr', spend: 9800, reachFactor: 3.5 },
];

const campaignPerformance = [
  { name: 'Summer Glow', reach: 142000, engagement: 5.2, reachFactor: 2.1, spend: 2400 },
  { name: 'FitPro App', reach: 380000, engagement: 3.8, reachFactor: 2.9, spend: 7000 },
  { name: 'TechDrop Q1', reach: 520000, engagement: 4.1, reachFactor: 3.2, spend: 6400 },
  { name: 'NomadPay', reach: 210000, engagement: 4.9, reachFactor: 2.4, spend: 4000 },
  { name: 'StyleForward', reach: 95000, engagement: 6.1, reachFactor: 1.8, spend: 0 },
];

const platformData = [
  { name: 'Instagram', value: 45, color: '#8b5cf6' },
  { name: 'YouTube', value: 32, color: '#3b82f6' },
  { name: 'TikTok', value: 18, color: '#ec4899' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

const topCreators = [
  {id: 123, name: 'Amara Johnson', handle: '@amaracooks', avatar: 'AJ', platform: 'TikTok', reachFactor: 4.1, engagement: 8.1, collabs: 1 },
  {id:234 , name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', platform: 'Instagram', reachFactor: 3.8, engagement: 6.8, collabs: 3 },
  { id:321 ,name: 'Carlos Rivera', handle: '@carlostravel', avatar: 'CR', platform: 'Instagram', reachFactor: 3.2, engagement: 4.9, collabs: 2 },
  {id: 234, name: 'Jake Thompson', handle: '@jakefitness', avatar: 'JT', platform: 'YouTube', reachFactor: 2.9, engagement: 3.8, collabs: 4 },
];

const kpis = [
  { label: 'Total Spend', value: '₹36,700', change: '+18%', up: true, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Total Reach Factor', value: '2.8x', change: '+0.4x', up: true, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Total Reach', value: '1.35M', change: '+32%', up: true, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Creators Hired', value: '23', change: '-2', up: false, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function AnalyticsContent() {
  const [period, setPeriod] = useState<'30d' | '90d' | '6m' | '1y'>('6m');

  const exportAnalytics = () => {
    downloadCsv('brand-analytics.csv', campaignPerformance.map(c => ({
      campaign: c.name,
      reach: c.reach,
      engagement: c.engagement,
      reachFactor: c.reachFactor,
      spend: c.spend,
    })));
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Campaign performance, reach factor insights, and creator analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['30d', '90d', '6m', '1y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {p}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {kpi.change} vs last period
            </div>
          </div>
        ))}
      </div>

      {/* Spend + ROI Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Spend vs Reach Factor Trend</h2>
            <p className="text-xs text-slate-400 mt-0.5">Monthly campaign investment and reach multiplier</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Spend</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Reach Factor</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={spendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }}
              formatter={(value: number, name: string) => name === 'spend' ? [`₹${value.toLocaleString()}`, 'Spend'] : [`${value}x`, 'Reach Factor']}
            />
            <Area type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={2} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Campaign Performance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Campaign Performance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={campaignPerformance} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }} formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, 'Reach']} />
              <Bar dataKey="reach" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Split */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }} formatter={(v: number) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Creators */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Top Performing Creators</h2>
          <span className="text-xs text-slate-400">Ranked by Reach Factor</span>
        </div>
        <div className="space-y-3">
          {topCreators.map((creator, i) => (
            <div key={creator.id || creator.handle} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                {i + 1}
              </span>
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-700 text-xs font-bold">{creator.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{creator.name}</p>
                <p className="text-xs text-violet-600">{creator.handle}</p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-bold text-emerald-700 tabular-nums">{creator.reachFactor}x</p>
                  <p className="text-xs text-slate-400">Reach Factor</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 tabular-nums">{creator.engagement}%</p>
                  <p className="text-xs text-slate-400">Engagement</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 tabular-nums">{creator.collabs}</p>
                  <p className="text-xs text-slate-400">Collabs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
