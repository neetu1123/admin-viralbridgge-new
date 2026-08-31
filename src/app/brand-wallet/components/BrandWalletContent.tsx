'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { brandApi } from '@/src/lib/api';
import { mapEscrowRows, type EscrowRow } from '@/src/lib/mappers';
import OpenDisputeModal from '@/src/components/disputes/OpenDisputeModal';
import MyDisputesPanel from '@/src/components/disputes/MyDisputesPanel';
import AddFundsModal from '@/src/components/wallet/AddFundsModal';
import { DollarSign, TrendingUp, Lock, ArrowUpRight, ArrowDownLeft, ChevronDown, Download, Plus, Shield, FileText, Brain, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const spendHistory = [
  { month: 'Nov', spend: 4200, campaigns: 2 },
  { month: 'Dec', spend: 6800, campaigns: 3 },
  { month: 'Jan', spend: 5100, campaigns: 2 },
  { month: 'Feb', spend: 9200, campaigns: 4 },
  { month: 'Mar', spend: 7600, campaigns: 3 },
  { month: 'Apr', spend: 9800, campaigns: 4 },
];

const predictedSpend = [
  { month: 'May', predicted: 11200, actual: null },
  { month: 'Jun', predicted: 13500, actual: null },
  { month: 'Jul', predicted: 12800, actual: null },
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

const invoices = [
  { id: 'inv-001', campaign: 'TechDrop Q1 Earbuds', creator: 'Jordan Osei', amount: 3500, status: 'paid', date: '2026-04-09', dueDate: '2026-04-12' },
  { id: 'inv-002', campaign: 'Summer Glow Skincare', creator: 'Sofia Martinez', amount: 1200, status: 'paid', date: '2026-04-13', dueDate: '2026-04-16' },
  { id: 'inv-003', campaign: 'FitPro Challenge', creator: 'Marcus Webb', amount: 2800, status: 'pending', date: '2026-04-20', dueDate: '2026-04-23' },
  { id: 'inv-004', campaign: 'NomadPay Travel', creator: 'Kavya Reddy', amount: 2000, status: 'pending', date: '2026-04-22', dueDate: '2026-04-25' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  held: { label: 'In Escrow', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  released: { label: 'Released', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  refunded: { label: 'Refunded', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

type WalletTab = 'overview' | 'escrow' | 'invoices';

const escrowStatusLabel: Record<string, string> = {
  HELD: 'In Escrow',
  RELEASED: 'Released',
  DISPUTED: 'Dispute Active',
  REFUNDED: 'Refunded',
};

export default function BrandWalletContent() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<WalletTab>('overview');
  const [escrows, setEscrows] = useState<EscrowRow[]>([]);
  const [escrowsLoading, setEscrowsLoading] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState<EscrowRow | null>(null);
  const [disputeRefreshKey, setDisputeRefreshKey] = useState(0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [inEscrow, setInEscrow] = useState(0);
  const [apiTransactions, setApiTransactions] = useState<Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    created_at: string;
  }>>([]);

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const [wallet, txns] = await Promise.all([
        brandApi.getWallet(),
        brandApi.getTransactions({ limit: 50 }),
      ]);
      setAvailableBalance(Number(wallet.available_balance ?? 0));
      setInEscrow(Number(wallet.pending_balance ?? 0));
      const rows = (txns as { data?: typeof apiTransactions }).data ?? [];
      setApiTransactions(rows);
    } catch {
      setAvailableBalance(0);
      setInEscrow(0);
      setApiTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadEscrows = useCallback(async () => {
    setEscrowsLoading(true);
    try {
      const data = await brandApi.getEscrows();
      setEscrows(mapEscrowRows(data));
    } catch {
      setEscrows([]);
    } finally {
      setEscrowsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (activeTab === 'escrow') loadEscrows();
  }, [activeTab, loadEscrows, disputeRefreshKey]);

  const totalSpent = apiTransactions
    .filter((t) => t.type === 'ESCROW_RELEASE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  const predictedMonthlySpend = Math.round((availableBalance + inEscrow) * 0.35) || 0;

  const txnTypeMap: Record<string, string> = {
    ADD_FUNDS: 'topup',
    DEPOSIT: 'topup',
    ESCROW_LOCK: 'escrow_lock',
    ESCROW_HOLD: 'escrow_lock',
    ESCROW_RELEASE: 'payment',
    REFUND: 'refund',
    WITHDRAWAL: 'payment',
  };

  const displayTransactions = apiTransactions.length > 0
    ? apiTransactions.map((t) => ({
        id: t.id,
        type: txnTypeMap[t.type] ?? 'payment',
        description: t.type.replace(/_/g, ' '),
        campaign: undefined as string | undefined,
        amount: ['ESCROW_LOCK', 'ESCROW_HOLD', 'WITHDRAWAL'].includes(t.type) ? -t.amount : t.amount,
        status: t.status === 'COMPLETED' ? 'completed' : t.status.toLowerCase(),
        date: new Date(t.created_at).toISOString().slice(0, 10),
      }))
    : transactions;

  const filtered = displayTransactions.filter(t => typeFilter === 'all' || t.type === typeFilter);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Wallet & Budget Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1">Escrow protection, spend forecasting & invoice management</p>
        </div>
        <button
          onClick={() => setShowAddFunds(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          <Plus size={16} />
          Add Funds
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide">Available Balance</p>
            <DollarSign size={18} className="text-violet-300" />
          </div>
          <p className="text-3xl font-black tabular-nums">
            {walletLoading ? '...' : `₹${availableBalance.toLocaleString()}`}
          </p>
          <p className="text-violet-300 text-xs mt-1">Ready to allocate</p>
        </div>
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">In Escrow</p>
            <Shield size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tabular-nums">
            {walletLoading ? '...' : `₹${inEscrow.toLocaleString()}`}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle size={11} className="text-emerald-500" />
            <p className="text-emerald-600 text-xs font-semibold">Escrow Protected</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Spent</p>
            <ArrowUpRight size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tabular-nums">₹{totalSpent.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">Paid to creators</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Predicted Spend</p>
            <Brain size={16} className="text-violet-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 tabular-nums">₹{predictedMonthlySpend.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={11} className="text-violet-500" />
            <p className="text-violet-600 text-xs font-semibold">Next month forecast</p>
          </div>
        </div>
      </div>

      {/* Escrow Protection Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-800">Escrow Protection Active</p>
          <p className="text-xs text-blue-600 mt-0.5">All campaign funds are held securely in escrow and released only after creator deliverables are approved. Your money is always protected.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <p className="text-lg font-black text-blue-700">₹{inEscrow.toLocaleString()}</p>
            <p className="text-xs text-blue-500">Currently locked</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {([['overview', 'Overview & Spend'], ['escrow', 'Escrow Tracker'], ['invoices', 'Invoice Center']] as [WalletTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${activeTab === tab ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-700">Monthly Spend + Forecast</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Actual spend + AI-predicted next 3 months</p>
                </div>
                <button onClick={() => toast.success('Export started')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <Download size={13} /> Export
                </button>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={[...spendHistory, ...predictedSpend.map(p => ({ month: p.month, spend: p.predicted, campaigns: 0, predicted: true }))]}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Spend']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="spend" stroke="#7c3aed" strokeWidth={2} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Spend by Campaign</h2>
              <div className="space-y-3">
                {campaignSpend.map(c => {
                  const pct = Math.round((c.spend / c.budget) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-700 truncate flex-1 mr-2">{c.name}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-emerald-700 font-bold">{c.roi}</span>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Transaction History</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none text-slate-700">
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
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
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
                        {isPositive ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'escrow' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Escrow Holdings</h2>
            {escrowsLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Loading escrow...</p>
            ) : escrows.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No escrow holdings yet. Accept creators on campaigns to lock funds.</p>
            ) : (
              <div className="space-y-3">
                {escrows.map((e) => (
                  <div
                    key={e.id}
                    className={`border rounded-2xl p-4 transition-colors ${e.status === 'DISPUTED' ? 'border-red-200 bg-red-50/30' : 'border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{e.campaignTitle}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{e.creatorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-800">₹{e.amount.toLocaleString()}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.status === 'DISPUTED' ? 'bg-red-100 text-red-700' : e.status === 'HELD' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {escrowStatusLabel[e.status] ?? e.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {e.status === 'HELD' && !e.hasOpenDispute && (
                        <button
                          onClick={async () => {
                            try {
                              await brandApi.releaseEscrow(e.id);
                              toast.success('Funds released to creator');
                              loadEscrows();
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : 'Release failed');
                            }
                          }}
                          className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition-colors"
                        >
                          Release Funds
                        </button>
                      )}
                      {e.canDispute && (
                        <button
                          onClick={() => setDisputeTarget(e)}
                          className="flex-1 text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 py-2 rounded-xl transition-colors"
                        >
                          Raise Issue
                        </button>
                      )}
                      {e.hasOpenDispute && (
                        <span className="flex-1 text-center text-xs font-semibold text-red-600 py-2">Dispute under review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <MyDisputesPanel role="brand" refreshKey={disputeRefreshKey} />
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">Invoice Center</h2>
            <button onClick={() => toast.success('Invoice downloaded')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <Download size={13} /> Export All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                    <FileText size={14} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{inv.campaign}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Creator: {inv.creator} · Due: {inv.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {inv.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">₹{inv.amount.toLocaleString()}</p>
                  <button onClick={() => toast.success('Invoice downloaded')} className="text-xs text-violet-600 hover:text-violet-700 font-semibold">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddFundsModal
        open={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        onSuccess={loadWallet}
      />

      <OpenDisputeModal
        open={!!disputeTarget}
        onClose={() => setDisputeTarget(null)}
        role="brand"
        campaignId={disputeTarget?.campaignId ?? ''}
        campaignTitle={disputeTarget?.campaignTitle ?? ''}
        creatorId={disputeTarget?.creatorId}
        creatorName={disputeTarget?.creatorName}
        amount={disputeTarget?.amount}
        escrowStatus={disputeTarget?.status}
        onSuccess={() => {
          setDisputeRefreshKey((k) => k + 1);
          loadEscrows();
        }}
      />
    </div>
  );
}
