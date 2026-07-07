'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, ArrowUpRight, ArrowDownLeft, Lock, RefreshCw, TrendingUp, Loader2, Unlock, RotateCcw } from 'lucide-react';
import { adminApi } from '@/src/lib/api';
import { downloadCsv } from '@/src/lib/exportCsv';
import { mapAdminTransactions, type AdminTransactionRow } from '@/src/lib/mappers';

interface AdminTransaction {
  id: string;
  type: 'brand_to_escrow' | 'escrow_to_creator' | 'withdrawal' | 'refund' | 'credit';
  from: string; to: string; amount: number;
  paymentStatus: string;
  date: string; campaignId?: string; campaignTitle?: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  brand_to_escrow: { label: 'Brand → Escrow', icon: Lock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  escrow_to_creator: { label: 'Escrow → Creator', icon: ArrowDownLeft, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-slate-700 bg-slate-100 border-slate-200' },
  refund: { label: 'Refund', icon: RefreshCw, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  credit: { label: 'Credit', icon: TrendingUp, color: 'text-violet-700 bg-violet-50 border-violet-200' },
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  held: { label: 'Held', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  released: { label: 'Released', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  disputed: { label: 'Disputed', cls: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  failed: { label: 'Failed', cls: 'bg-red-100 text-red-800 border border-red-300' },
};

export default function AdminTransactionsContent() {
  const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTransactions();
      setAdminTransactions(mapAdminTransactions(data) as AdminTransaction[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions');
      setAdminTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = adminTransactions.filter(t => {
    const matchSearch = t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase()) || (t.campaignTitle ?? '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.paymentStatus === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalVolume = adminTransactions.reduce((s, t) => s + t.amount, 0);
  const heldInEscrow = adminTransactions.filter(t => t.paymentStatus === 'held').reduce((s, t) => s + t.amount, 0);
  const disputed = adminTransactions.filter(t => t.paymentStatus === 'disputed').length;
  const pending = adminTransactions.filter(t => t.paymentStatus === 'pending').length;

  const handleExport = () => {
    if (!filtered.length) {
      toast.error('No transactions to export');
      return;
    }
    downloadCsv(
      `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map(t => ({
        id: t.id,
        type: t.type,
        from: t.from,
        to: t.to,
        amount: t.amount,
        status: t.paymentStatus,
        date: t.date,
        campaign: t.campaignTitle ?? '',
      })),
    );
    toast.success('Export complete');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction Management</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all financial flows — escrow, payouts, withdrawals, and disputes</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all">
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Volume', value: `$${totalVolume.toLocaleString()}`, sub: 'all transactions', color: 'text-violet-700' },
          { label: 'Held in Escrow', value: `$${heldInEscrow.toLocaleString()}`, sub: 'currently locked', color: 'text-blue-700' },
          { label: 'Disputed', value: disputed, sub: 'require resolution', color: 'text-red-700' },
          { label: 'Pending Withdrawal', value: pending, sub: 'awaiting approval', color: 'text-amber-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by party or campaign..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full"
            />
          </div>
          <div className="relative">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Types</option>
              <option value="brand_to_escrow">Brand → Escrow</option>
              <option value="escrow_to_creator">Escrow → Creator</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Statuses</option>
              <option value="held">Held</option>
              <option value="released">Released</option>
              <option value="disputed">Disputed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['ID', 'Type', 'From', 'To', 'Campaign', 'Amount', 'Status', 'Date', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(txn => {
                const config = typeConfig[txn.type];
                const TxnIcon = config.icon;
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-400">{txn.id}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${config.color}`}>
                        <TxnIcon size={11} />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{txn.from}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{txn.to}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {txn.campaignTitle ? (
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-[140px]">{txn.campaignTitle}</p>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800 tabular-nums">${txn.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig[txn.paymentStatus]?.cls}`}>
                        {statusConfig[txn.paymentStatus]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-600">{txn.date}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {txn.paymentStatus === 'held' && (
                          <button onClick={() => toast.success(`Payment released: ${txn.id}`)} className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors" title="Release payment">
                            <Unlock size={13} />
                          </button>
                        )}
                        {txn.paymentStatus === 'released' && (
                          <button onClick={() => toast.warning(`Payment held: ${txn.id}`)} className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors" title="Hold payment">
                            <Lock size={13} />
                          </button>
                        )}
                        {(txn.paymentStatus === 'disputed' || txn.paymentStatus === 'held') && (
                          <button onClick={() => toast.success(`Refund issued: ${txn.id}`)} className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-500 transition-colors" title="Refund">
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
