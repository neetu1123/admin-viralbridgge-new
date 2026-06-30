'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { creatorApi } from '@/src/lib/api';
import { mapEscrowRows, type EscrowRow } from '@/src/lib/mappers';
import OpenDisputeModal from '@/src/components/disputes/OpenDisputeModal';
import MyDisputesPanel from '@/src/components/disputes/MyDisputesPanel';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, Lock, TrendingUp, ChevronDown, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import WithdrawModal from './WithdrawModal';
import WalletChart from './WalletChart';
// import Icon from '@/components/ui/AppIcon';


interface ApiTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference_id?: string | null;
  balance_after?: number | null;
  created_at: string;
}

interface DisplayTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  date: string;
  balance: number | null;
}

function mapTxnType(raw: string): string {
  const t = raw.toUpperCase();
  if (t.includes('RELEASE') || t === 'ESCROW_RELEASE') return 'escrow_release';
  if (t.includes('LOCK') || t === 'ESCROW_LOCK' || t === 'ESCROW_HOLD') return 'escrow_lock';
  if (t.includes('WITHDRAW')) return 'withdrawal';
  if (t.includes('REFUND')) return 'refund';
  if (t.includes('TOPUP') || t.includes('ADD_FUNDS') || t.includes('DEPOSIT')) return 'credit';
  return 'debit';
}

function mapTxnStatus(raw: string): string {
  const s = raw.toUpperCase();
  if (s === 'COMPLETED' || s === 'APPROVED') return 'completed';
  if (s === 'PENDING') return 'pending';
  if (s === 'REJECTED' || s === 'FAILED') return 'failed';
  return 'completed';
}

function txnDescription(type: string, amount: number): string {
  const labels: Record<string, string> = {
    escrow_release: 'Payment released from escrow',
    escrow_lock: 'Funds locked in escrow',
    withdrawal: 'Withdrawal request',
    refund: 'Refund processed',
    credit: 'Funds added',
    debit: 'Debit',
  };
  return labels[type] ?? `Transaction — ${amount}`;
}

const escrowStatusLabel: Record<string, string> = {
  HELD: 'In Escrow',
  RELEASED: 'Released',
  DISPUTED: 'Dispute Active',
  REFUNDED: 'Refunded',
};

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
  const [escrowItems, setEscrowItems] = useState<EscrowRow[]>([]);
  const [disputeTarget, setDisputeTarget] = useState<EscrowRow | null>(null);
  const [disputeRefreshKey, setDisputeRefreshKey] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [txnTotal, setTxnTotal] = useState(0);

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const wallet = await creatorApi.getWallet() as {
        available_balance?: number;
        lifetime_earnings?: number;
        pending_balance?: number;
        locked_balance?: number;
      };
      setAvailableBalance(Number(wallet.available_balance ?? 0));
      setLifetimeEarnings(Number(wallet.lifetime_earnings ?? 0));
    } catch {
      setAvailableBalance(0);
      setLifetimeEarnings(0);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await creatorApi.getTransactions({ page, limit: perPage }) as {
        data?: ApiTransaction[];
        meta?: { total?: number };
      };
      const rows = res.data ?? [];
      setTxnTotal(res.meta?.total ?? rows.length);
      setTransactions(
        rows.map((t) => {
          const mappedType = mapTxnType(t.type);
          return {
            id: t.id,
            type: mappedType,
            amount: mappedType === 'withdrawal' ? -Math.abs(t.amount) : t.amount,
            description: txnDescription(mappedType, t.amount),
            status: mapTxnStatus(t.status),
            date: t.created_at,
            balance: t.balance_after ?? null,
          };
        }),
      );
    } catch {
      setTransactions([]);
      setTxnTotal(0);
    }
  }, [page]);

  const loadEscrows = useCallback(async () => {
    try {
      const data = await creatorApi.getEscrows();
      setEscrowItems(mapEscrowRows(data));
    } catch {
      setEscrowItems([]);
    }
  }, []);

  useEffect(() => {
    loadWallet();
    loadEscrows();
  }, [loadWallet, loadEscrows, disputeRefreshKey]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const escrowBalance = escrowItems
    .filter((e) => e.status === 'HELD' || e.status === 'DISPUTED' || e.status === 'IN_PROGRESS' || e.status === 'REVIEW')
    .reduce((s, e) => s + e.amount, 0);

  const filteredTxns = transactions.filter((t) => typeFilter === 'all' || t.type === typeFilter);
  const totalPages = Math.max(1, Math.ceil(txnTotal / perPage));
  const paginated = filteredTxns;

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
          <p className="text-3xl font-bold tabular-nums">
            {walletLoading ? '…' : `₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-violet-300 text-xs mt-1">Ready to withdraw</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">In Escrow</p>
            <Lock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{escrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-blue-600 text-xs mt-1">{escrowItems.length} active campaigns</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Earned</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{lifetimeEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-emerald-600 text-xs mt-1">All time</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Pending Withdrawal</p>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{pendingWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
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
          {escrowItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No escrow holdings</p>
          ) : (
            escrowItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${item.status === 'DISPUTED' ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <Lock size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.campaignTitle}</p>
                      <p className="text-xs text-slate-400">
                        {item.brandName} · {escrowStatusLabel[item.status] ?? item.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-700 tabular-nums">₹{item.amount.toLocaleString()}</p>
                  </div>
                </div>
                {item.canDispute && (
                  <button
                    onClick={() => setDisputeTarget(item)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 rounded-lg transition-colors"
                  >
                    <AlertTriangle size={12} /> Raise Issue
                  </button>
                )}
                {item.hasOpenDispute && (
                  <p className="mt-2 text-xs text-center font-medium text-red-600">Dispute under admin review</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-6">
        <MyDisputesPanel role="creator" refreshKey={disputeRefreshKey} />
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
                {['Type', 'Description', 'Date', 'Status', 'Amount', 'Balance'].map(col => (
                  <th key={`txn-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    {walletLoading ? 'Loading transactions…' : 'No transactions yet'}
                  </td>
                </tr>
              ) : paginated.map(txn => {
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
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-600">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={txn.status as 'completed' | 'pending' | 'failed' | 'released' | 'escrow'} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-slate-600 tabular-nums font-mono">
                        {txn.balance != null
                          ? `₹${txn.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '—'}
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
            Showing {paginated.length === 0 ? 0 : (page - 1) * perPage + 1}–{(page - 1) * perPage + paginated.length} of {txnTotal} transactions
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
            toast.success('Withdrawal request submitted — pending admin approval');
            loadWallet();
            loadTransactions();
          }}
        />
      )}

      <OpenDisputeModal
        open={!!disputeTarget}
        onClose={() => setDisputeTarget(null)}
        role="creator"
        campaignId={disputeTarget?.campaignId ?? ''}
        campaignTitle={disputeTarget?.campaignTitle ?? ''}
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