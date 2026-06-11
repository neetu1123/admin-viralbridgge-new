'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ArrowUpRight, RotateCcw, DollarSign } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { adminApi } from '@/src/lib/api';
import { mapAdminDisputes, type AdminDisputeRow } from '@/src/lib/mappers';

export default function DisputesContent() {
  const [disputes, setDisputes] = useState<AdminDisputeRow[]>([]);
  const [stats, setStats] = useState({ openCount: 0, totalAtStake: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        adminApi.getDisputes(filter === 'all' ? {} : { status: filter }),
        adminApi.getDisputeStats(),
      ]);
      setDisputes(mapAdminDisputes(listRes));
      setStats(statsRes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const openCount = stats.openCount;
  const filtered = filter === 'all' ? disputes : disputes.filter((d) => d.status === filter);

  const handleAction = async (
    id: string,
    action: 'resolve' | 'refund' | 'escalate' | 'partial_payout',
    dispute: AdminDisputeRow,
  ) => {
    setActionId(id);
    try {
      if (action === 'resolve') {
        await adminApi.resolveDispute(id);
      } else if (action === 'refund') {
        await adminApi.refundDispute(id);
      } else if (action === 'escalate') {
        await adminApi.escalateDispute(id);
      } else if (action === 'partial_payout') {
        const creatorAmount = Math.round(dispute.amount * 0.6);
        const brandAmount = dispute.amount - creatorAmount;
        await adminApi.partialPayoutDispute(id, { creatorAmount, brandAmount });
      }
      const labels: Record<string, string> = {
        resolve: 'Dispute resolved',
        refund: 'Refund issued',
        escalate: 'Escalated to senior team',
        partial_payout: 'Partial payout issued',
      };
      toast.success(labels[action]);
      await loadDisputes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  if (loading && disputes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Disputes</h1>
        <p className="text-slate-500 text-sm mt-1">Manage creator vs brand disputes and issue resolutions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
          <p className="text-red-700 text-xs font-bold uppercase tracking-wide mb-2">Open Disputes</p>
          <p className="text-3xl font-extrabold text-red-700">{openCount}</p>
          <p className="text-red-500 text-xs mt-1">Require resolution</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total at Stake</p>
          <p className="text-3xl font-extrabold text-slate-800">₹{stats.totalAtStake.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">In open disputes</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">Resolved</p>
          <p className="text-3xl font-extrabold text-emerald-700">{stats.resolvedCount}</p>
          <p className="text-slate-400 text-xs mt-1">Successfully closed</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'open', 'escalated', 'resolved', 'refunded'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border capitalize ${filter === s ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            {s}
            {s === 'open' && openCount > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-700 px-1 rounded-full">{openCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((dispute) => {
          const status = dispute.status;
          const isActionable = status === 'open' || status === 'escalated';
          const busy = actionId === dispute.id;
          return (
            <div
              key={dispute.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm ${status === 'escalated' ? 'border-orange-200 bg-orange-50/20' : status === 'open' ? 'border-red-200' : 'border-slate-200'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${dispute.priority === 'high' ? 'bg-red-100 text-red-700' : dispute.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {dispute.priority.toUpperCase()} PRIORITY
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status === 'open' ? 'bg-red-50 text-red-700 border-red-200' : status === 'escalated' ? 'bg-orange-50 text-orange-700 border-orange-200' : status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-400">Raised by {dispute.raisedBy}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{dispute.campaignTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                    <span className="font-medium text-violet-700">{dispute.creator}</span>
                    <span className="text-slate-300">vs</span>
                    <span className="font-medium text-blue-700">{dispute.brand}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">₹{dispute.amount.toLocaleString()} at stake</span>
                    <span className="text-slate-300">·</span>
                    <span>Opened {dispute.openedAt}</span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{dispute.reason}</p>
                </div>
                {isActionable && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      disabled={busy}
                      onClick={() => handleAction(dispute.id, 'resolve', dispute)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Resolve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleAction(dispute.id, 'partial_payout', dispute)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <DollarSign size={12} /> Partial Payout
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleAction(dispute.id, 'refund', dispute)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      <RotateCcw size={12} /> Refund
                    </button>
                    {status !== 'escalated' && (
                      <button
                        disabled={busy}
                        onClick={() => handleAction(dispute.id, 'escalate', dispute)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        <ArrowUpRight size={12} /> Escalate
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No disputes in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
