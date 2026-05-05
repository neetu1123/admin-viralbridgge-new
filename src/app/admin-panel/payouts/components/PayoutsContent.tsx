'use client';
import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import StatusBadge from '@/src/components/ui/StatusBadge';

const payouts = [
  { id: 'wd-001', creator: 'Priya Nair', email: 'priya@creators.io', amount: 2000, method: 'Bank Transfer (ACH)', account: '****8821', status: 'pending', requestedAt: '2026-04-07', fee: 15 },
  { id: 'wd-002', creator: 'Jordan Osei', email: 'jordan@fitcreators.io', amount: 1500, method: 'PayPal', account: 'jordan@fitcreators.io', status: 'pending', requestedAt: '2026-04-08', fee: 15 },
  { id: 'wd-003', creator: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', amount: 800, method: 'Stripe Instant', account: '****4412', status: 'pending', requestedAt: '2026-04-09', fee: 12 },
  { id: 'wd-004', creator: 'Marcus Webb', email: 'marcus@ugcpro.io', amount: 350, method: 'PayPal', account: 'marcus@ugcpro.io', status: 'pending', requestedAt: '2026-04-10', fee: 5.25 },
  { id: 'wd-005', creator: 'Yuki Tanaka', email: 'yuki@beautyco.jp', amount: 1300, method: 'Wise', account: 'yuki@beautyco.jp', status: 'pending', requestedAt: '2026-04-11', fee: 15 },
  { id: 'wd-006', creator: 'Daniela Rossi', email: 'd.rossi@creators.eu', amount: 2200, method: 'Bank Transfer', account: '****9901', status: 'approved', requestedAt: '2026-04-06', fee: 15 },
  { id: 'wd-007', creator: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', amount: 900, method: 'Wise', account: 'meichen@skinfluencer.co', status: 'rejected', requestedAt: '2026-04-05', fee: 13.5 },
];

export default function PayoutsContent() {
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(payouts.map(p => [p.id, p.status])));

  const pending = payouts.filter(p => statuses[p.id] === 'pending');
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setStatuses(prev => ({ ...prev, [id]: action }));
    const p = payouts.find(x => x.id === id);
    toast.success(`Payout ${action} for ${p?.creator}`);
  };

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
          <p className="text-3xl font-extrabold">${totalPending.toLocaleString()}</p>
          <p className="text-amber-100 text-xs mt-1">{pending.length} requests awaiting</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Approved Today</p>
          <p className="text-3xl font-extrabold text-emerald-700">${payouts.filter(p => statuses[p.id] === 'approved').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">{payouts.filter(p => statuses[p.id] === 'approved').length} payouts processed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Fees Collected</p>
          <p className="text-3xl font-extrabold text-violet-700">${payouts.reduce((s, p) => s + p.fee, 0).toFixed(2)}</p>
          <p className="text-slate-400 text-xs mt-1">Across all requests</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{pending.length} payout{pending.length !== 1 ? 's' : ''} pending — process within 1 business day</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Creator', 'Amount', 'Net Payout', 'Method', 'Account', 'Status', 'Requested', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payouts.map(p => {
                const status = statuses[p.id];
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${status === 'pending' ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{p.creator}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.email}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800">${p.amount.toLocaleString()}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm font-semibold text-emerald-700">${(p.amount - p.fee).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">fee: ${p.fee.toFixed(2)}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{p.method}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs font-mono text-slate-500">{p.account}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={status as 'pending' | 'approved' | 'rejected'} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-500">{p.requestedAt}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAction(p.id, 'approved')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors"><CheckCircle size={12} /> Approve</button>
                          <button onClick={() => handleAction(p.id, 'rejected')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"><XCircle size={12} /> Reject</button>
                        </div>
                      ) : <span className="text-xs text-slate-400 capitalize">{status}</span>}
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
