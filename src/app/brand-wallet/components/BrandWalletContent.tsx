'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { DollarSign, TrendingUp, Lock, ArrowUpRight, ArrowDownLeft, ChevronDown, Download, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const spendHistory = [
  { month: 'Nov', spend: 4200, campaigns: 2 },
  { month: 'Dec', spend: 6800, campaigns: 3 },
  { month: 'Jan', spend: 5100, campaigns: 2 },
  { month: 'Feb', spend: 9200, campaigns: 4 },
  { month: 'Mar', spend: 7600, campaigns: 3 },
  { month: 'Apr', spend: 9800, campaigns: 4 },
];

const campaignSpend = [
  { name: 'Summer Glow', spend: 2400, budget: 6000, roi: '2.8x' },
  { name: 'FitPro Challenge', spend: 7000, budget: 10500, roi: '3.4x' },
  { name: 'TechDrop Earbuds', spend: 6400, budget: 6400, roi: '3.2x' },
  { name: 'NomadPay Travel', spend: 4000, budget: 8000, roi: '2.1x' },
];

const transactions = [
  { id: 'bt-001', type: 'escrow_lock', description: 'Funds locked — Summer Glow Skincare Launch', campaign: 'Summer Glow Skincare Launch', amount: -6000, status: 'held', date: '2026-04-11' },
  { id: 'bt-002', type: 'escrow_lock', description: 'Funds locked — FitPro 30-Day Challenge', campaign: 'FitPro App — 30-Day Challenge', amount: -10500, status: 'held', date: '2026-04-08' },
  { id: 'bt-003', type: 'payment', description: 'Payment released to Jordan Osei', campaign: 'FitPro App — 30-Day Challenge', amount: -3500, status: 'released', date: '2026-04-09' },
  { id: 'bt-004', type: 'payment', description: 'Payment released to Sofia Martinez', campaign: 'Summer Glow Skincare Launch', amount: -1200, status: 'released', date: '2026-04-13' },
  { id: 'bt-005', type: 'escrow_lock', description: 'Funds locked — NomadPay Travel Push', campaign: 'NomadPay Travel Creator Push', amount: -8000, status: 'held', date: '2026-04-05' },
  { id: 'bt-006', type: 'refund', description: 'Partial refund — campaign cancelled', campaign: 'StyleForward Fall Collection', amount: 2400, status: 'refunded', date: '2026-04-03' },
  { id: 'bt-007', type: 'topup', description: 'Wallet top-up via credit card', campaign: undefined, amount: 15000, status: 'completed', date: '2026-04-01' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  held: { label: 'In Escrow', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  released: { label: 'Released', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  refunded: { label: 'Refunded', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

export default function BrandWalletContent() {
  const [typeFilter, setTypeFilter] = useState('all');

  const totalBudget = 41700;
  const inEscrow = 22100;
  const totalSpent = 19600;
  const availableBalance = 8300;

  const filtered = transactions.filter(t => typeFilter === 'all' || t.type === typeFilter);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wallet & Spend</h1>
          <p className="text-slate-500 text-sm mt-1">Track your campaign budget, escrow, and payment history</p>
        </div>
        <button
          onClick={() => toast.success('Top-up initiated')}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus size={16} />
          Add Funds
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-5 text-white shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-violet-200 text-xs font-medium uppercase tracking-wide">Available Balance</p>
            <DollarSign size={18} className="text-violet-300" />
          </div>
          <p className="text-3xl font-bold tabular-nums">₹{availableBalance.toLocaleString()}</p>
          <p className="text-violet-300 text-xs mt-1">Ready to allocate</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">In Escrow</p>
            <Lock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{inEscrow.toLocaleString()}</p>
          <p className="text-blue-600 text-xs mt-1">Locked for active campaigns</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Spent</p>
            <ArrowUpRight size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{totalSpent.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">Paid to creators</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Allocated</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{totalBudget.toLocaleString()}</p>
          <p className="text-emerald-600 text-xs mt-1">Across all campaigns</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Spend trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Monthly Spend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
            </div>
            <button onClick={() => toast.success('Export started')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={13} /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={spendHistory}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Spend']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="spend" stroke="#7c3aed" strokeWidth={2} fill="url(#spendGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign spend breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Spend by Campaign</h2>
          <div className="space-y-3">
            {campaignSpend.map(c => {
              const pct = Math.round((c.spend / c.budget) * 100);
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-700 truncate flex-1 mr-2">{c.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-emerald-700 font-semibold">{c.roi}</span>
                      <span className="text-xs text-slate-500 tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">₹{c.spend.toLocaleString()} / ₹{c.budget.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Transaction History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none text-slate-700">
                <option value="all">All Types</option>
                <option value="escrow_lock">Escrow Lock</option>
                <option value="payment">Payments</option>
                <option value="refund">Refunds</option>
                <option value="topup">Top-ups</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map(txn => {
            const isPositive = txn.amount > 0;
            return (
              <div key={txn.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    {isPositive ? <ArrowDownLeft size={14} className="text-emerald-600" /> : <ArrowUpRight size={14} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{txn.description}</p>
                    {txn.campaign && <p className="text-xs text-slate-400 mt-0.5">{txn.campaign}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig[txn.status]?.cls}`}>{statusConfig[txn.status]?.label}</span>
                  <p className="text-xs text-slate-400">{txn.date}</p>
                  <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {isPositive ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
