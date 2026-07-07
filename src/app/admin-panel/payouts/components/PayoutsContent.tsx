'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { adminApi } from '@/src/lib/api';
import { mapAdminWithdrawals, type AdminWithdrawalRow } from '@/src/lib/mappers';

export default function PayoutsContent() {
  const [payouts, setPayouts] = useState<AdminWithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getWithdrawals('ALL');
      setPayouts(mapAdminWithdrawals(data));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load payouts');
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = payouts.filter(p => p.status === 'pending');
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActingId(id);
    try {
      if (action === 'approved') {
        await adminApi.approveWithdrawal(id);
        toast.success('Payout approved');
      } else {
        await adminApi.rejectWithdrawal(id, 'Rejected by admin');
        toast.success('Payout rejected');
      }
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setActingId(null);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve creator withdrawal requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-wide mb-2">Pending Amount</p>
          <p className="text-3xl font-extrabold">₹{totalPending.toLocaleString()}</p>
          <p className="text-amber-100 text-xs mt-1">{pending.length} requests awaiting</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Approved</p>
          <p className="text-3xl font-extrabold text-emerald-700">
            ₹{payouts.filter(p => p.status === 'approved' || p.status === 'completed').reduce((s, p) => s + p.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Requests</p>
          <p className="text-3xl font-extrabold text-violet-700">{payouts.length}</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{pending.length} payout{pending.length !== 1 ? 's' : ''} pending review</p>
        </div>
      )}

      {payouts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No withdrawal requests yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Creator', 'Amount', 'Net Payout', 'Method', 'Status', 'Requested', 'Actions'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payouts.map(p => (
                  <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${p.status === 'pending' ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{p.creator}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.email}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800">₹{p.amount.toLocaleString()}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-emerald-700">₹{(p.amount - p.fee).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">fee: ₹{p.fee.toFixed(2)}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{p.method}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={(p.status === 'completed' ? 'approved' : p.status) as 'pending' | 'approved' | 'rejected'} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-500">{p.requestedAt}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {p.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actingId === p.id}
                            onClick={() => handleAction(p.id, 'approved')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            disabled={actingId === p.id}
                            onClick={() => handleAction(p.id, 'rejected')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 capitalize">{p.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
