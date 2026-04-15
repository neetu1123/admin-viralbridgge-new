'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, Lock, TrendingUp, ChevronDown, Download, RefreshCw } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import WithdrawModal from './WithdrawModal';
import WalletChart from './WalletChart';
// import Icon from '@/components/ui/AppIcon';


interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  campaign?: string;
  brand?: string;
  status: 'released' | 'escrow' | 'pending' | 'failed' | 'completed';
  date: string;
  balance: number;
}

const transactions: Transaction[] = [
  { id: 'txn-001', type: 'escrow_release', amount: 1200, description: 'Payment released — Summer Glow Campaign', campaign: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', status: 'released', date: '2026-04-13', balance: 3420.50 },
  { id: 'txn-002', type: 'escrow_lock', amount: 800, description: 'Funds locked in escrow — TechDrop Review', campaign: 'TechDrop Wireless Earbuds Review', brand: 'TechDrop', status: 'escrow', date: '2026-04-11', balance: 2220.50 },
  { id: 'txn-003', type: 'withdrawal', amount: -500, description: 'Withdrawal to PayPal — sofia@viralbridge.io', campaign: undefined, brand: undefined, status: 'completed', date: '2026-04-10', balance: 1420.50 },
  { id: 'txn-004', type: 'escrow_release', amount: 950, description: 'Payment released — FitPro 30-Day Challenge', campaign: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', status: 'released', date: '2026-04-08', balance: 1920.50 },
  { id: 'txn-005', type: 'credit', amount: 600, description: 'Bonus tip from brand — Harvest Kitchen', campaign: 'Harvest Kitchen Series', brand: 'Harvest Kitchen', status: 'released', date: '2026-04-06', balance: 970.50 },
  { id: 'txn-006', type: 'escrow_lock', amount: 1800, description: 'Funds locked in escrow — StyleForward Fall', campaign: 'StyleForward Fall Collection', brand: 'StyleForward', status: 'escrow', date: '2026-04-04', balance: 370.50 },
  { id: 'txn-007', type: 'escrow_release', amount: 750, description: 'Payment released — MindClear Wellness', campaign: 'MindClear Meditation App', brand: 'MindClear', status: 'released', date: '2026-04-02', balance: 2170.50 },
  { id: 'txn-008', type: 'withdrawal', amount: -1000, description: 'Withdrawal to bank account ****4821', campaign: undefined, brand: undefined, status: 'completed', date: '2026-03-31', balance: 1420.50 },
  { id: 'txn-009', type: 'escrow_release', amount: 1100, description: 'Payment released — NomadPay Travel Campaign', campaign: 'Wanderlust Travel Card Launch', brand: 'NomadPay', status: 'released', date: '2026-03-28', balance: 2420.50 },
  { id: 'txn-010', type: 'refund', amount: 200, description: 'Refund — campaign cancelled by brand', campaign: 'PureBrew Cold Brew Launch', brand: 'PureBrew Coffee', status: 'released', date: '2026-03-25', balance: 1320.50 },
  { id: 'txn-011', type: 'escrow_lock', amount: 550, description: 'Funds locked in escrow — PureBrew Launch', campaign: 'PureBrew Cold Brew Launch', brand: 'PureBrew Coffee', status: 'escrow', date: '2026-03-22', balance: 1120.50 },
  { id: 'txn-012', type: 'credit', amount: 450, description: 'Platform bonus — top creator of the week', campaign: undefined, brand: undefined, status: 'released', date: '2026-03-20', balance: 1670.50 },
];

const escrowItems = [
  { id: 'esc-001', campaign: 'TechDrop Wireless Earbuds Review', brand: 'TechDrop', amount: 800, lockedAt: '2026-04-11', expectedRelease: '2026-04-25', status: 'escrow' as const },
  { id: 'esc-002', campaign: 'StyleForward Fall Collection', brand: 'StyleForward', amount: 1800, lockedAt: '2026-04-04', expectedRelease: '2026-05-10', status: 'escrow' as const },
  { id: 'esc-003', campaign: 'Harvest Kitchen Home Chef Series', brand: 'Harvest Kitchen', amount: 600, lockedAt: '2026-04-14', expectedRelease: '2026-04-30', status: 'pending' as const },
];

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; amountColor: string }> = {
  credit:          { label: 'Credit',          icon: ArrowDownLeft,  color: 'text-emerald-600 bg-emerald-50', amountColor: 'text-emerald-700' },
  debit:           { label: 'Debit',           icon: ArrowUpRight,   color: 'text-red-600 bg-red-50',         amountColor: 'text-red-700' },
  escrow_lock:     { label: 'Escrow Lock',     icon: Lock,           color: 'text-blue-600 bg-blue-50',       amountColor: 'text-blue-700' },
  escrow_release:  { label: 'Escrow Released', icon: TrendingUp,     color: 'text-emerald-600 bg-emerald-50', amountColor: 'text-emerald-700' },
  withdrawal:      { label: 'Withdrawal',      icon: ArrowUpRight,   color: 'text-slate-600 bg-slate-100',    amountColor: 'text-slate-700' },
  refund:          { label: 'Refund',          icon: RefreshCw,      color: 'text-amber-600 bg-amber-50',     amountColor: 'text-amber-700' },
};

export default function WalletContent() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const availableBalance = 3420.50;
  const escrowBalance = escrowItems.reduce((s, e) => s + e.amount, 0);
  const totalEarned = 8650.00;
  const pendingWithdrawal = 0;

  const filteredTxns = transactions.filter(t => typeFilter === 'all' || t.type === typeFilter);
  const totalPages = Math.ceil(filteredTxns.length / perPage);
  const paginated = filteredTxns.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wallet & Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Track your earnings, escrow, and withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150"
        >
          <ArrowUpRight size={16} />
          Withdraw Funds
        </button>
      </div>

      {/* Balance cards — 4 cards, 4-col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-5 text-white shadow-card-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-violet-200 text-xs font-medium uppercase tracking-wide">Available Balance</p>
            <Wallet size={18} className="text-violet-300" />
          </div>
          <p className="text-3xl font-bold tabular-nums">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-violet-300 text-xs mt-1">Ready to withdraw</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">In Escrow</p>
            <Lock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">${escrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-blue-600 text-xs mt-1">{escrowItems.length} active campaigns</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Earned</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-emerald-600 text-xs mt-1">All time</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Pending Withdrawal</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">${pendingWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-slate-400 text-xs mt-1">Processing 1–3 business days</p>
        </div>
      </div>

      {/* Earnings chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Earnings History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Monthly earnings — last 6 months</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
        <WalletChart />
      </div>

      {/* Escrow tracker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Active Escrow</h2>
          <span className="text-xs text-slate-400">{escrowItems.length} campaigns</span>
        </div>
        <div className="space-y-3">
          {escrowItems.map(item => {
            const daysUntilRelease = Math.ceil((new Date(item.expectedRelease).getTime() - Date.now()) / 86400000);
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Lock size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.campaign}</p>
                    <p className="text-xs text-slate-400">{item.brand} · Locked {new Date(item.lockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold text-blue-700 tabular-nums">${item.amount.toLocaleString()}</p>
                  <p className={`text-xs mt-0.5 ${daysUntilRelease <= 7 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Release in {daysUntilRelease}d
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Transaction History</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none text-slate-700"
              >
                <option value="all">All Types</option>
                <option value="escrow_release">Escrow Released</option>
                <option value="escrow_lock">Escrow Lock</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="refund">Refunds</option>
                <option value="credit">Credits</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Type', 'Description', 'Campaign', 'Date', 'Status', 'Amount', 'Balance'].map(col => (
                  <th key={`txn-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(txn => {
                const config = typeConfig[txn.type];
                const Icon = config.icon;
                const isPositive = txn.type !== 'withdrawal' && txn.type !== 'debit';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700 line-clamp-1 max-w-xs">{txn.description}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {txn.campaign ? (
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-[160px]">{txn.campaign}</p>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {isPositive ? '+' : ''}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-slate-600 tabular-nums font-mono">
                        ${txn.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredTxns.length)} of {filteredTxns.length} transactions
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal
          availableBalance={availableBalance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            setShowWithdraw(false);
            toast.success('Withdrawal request submitted — 1–3 business days to process');
          }}
        />
      )}
    </div>
  );
}