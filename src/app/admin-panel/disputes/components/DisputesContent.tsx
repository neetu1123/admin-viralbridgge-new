'use client';
import React, { useState } from 'react';
import { CheckCircle, ArrowUpRight, RotateCcw, DollarSign } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const disputes = [
  { id: 'dsp-001', campaignTitle: 'TechDrop Earbuds Review', creator: 'Aisha Okonkwo', brand: 'TechDrop', reason: 'Brand claims deliverable did not meet brief requirements. Creator says brand changed requirements after submission.', amount: 6400, status: 'open', openedAt: '2026-04-10', priority: 'high' },
  { id: 'dsp-002', campaignTitle: 'EcoBottle Zero-Waste Push', creator: 'Mei-Lin Chen', brand: 'EcoBottle', reason: 'Creator submitted content 5 days late. Brand requesting partial refund of 40%.', amount: 3200, status: 'open', openedAt: '2026-04-08', priority: 'medium' },
  { id: 'dsp-003', campaignTitle: 'GameVault Pro Controller', creator: 'Marcus Webb', brand: 'GameVault', reason: 'Creator claims payment was not released after approved deliverable. Brand disputes approval.', amount: 1800, status: 'escalated', openedAt: '2026-04-06', priority: 'high' },
  { id: 'dsp-004', campaignTitle: 'NomadPay Travel Creator Push', creator: 'Jordan Osei', brand: 'NomadPay', reason: 'Creator withdrew from campaign mid-way. Brand requesting full refund of advance payment.', amount: 2000, status: 'resolved', openedAt: '2026-03-28', priority: 'low' },
  { id: 'dsp-005', campaignTitle: 'Summer Glow Skincare Launch', creator: 'Sofia Martinez', brand: 'Luminary Skincare', reason: 'Brand delayed payment release by 14 days beyond agreed timeline.', amount: 1200, status: 'refunded', openedAt: '2026-03-20', priority: 'medium' },
];

export default function DisputesContent() {
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(disputes.map(d => [d.id, d.status])));
  const [filter, setFilter] = useState('all');

  const openCount = disputes.filter(d => statuses[d.id] === 'open' || statuses[d.id] === 'escalated').length;
  const filtered = filter === 'all' ? disputes : disputes.filter(d => statuses[d.id] === filter);

  const handleAction = (id: string, action: 'resolve' | 'refund' | 'escalate' | 'partial_payout') => {
    const newStatus = action === 'resolve' ? 'resolved' : action === 'refund' || action === 'partial_payout' ? 'refunded' : 'escalated';
    setStatuses(prev => ({ ...prev, [id]: newStatus }));
    const labels: Record<string, string> = { resolve: 'Dispute resolved', refund: 'Refund issued', escalate: 'Escalated to senior team', partial_payout: 'Partial payout issued' };
    toast.success(labels[action]);
  };

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
          <p className="text-3xl font-extrabold text-slate-800">${disputes.filter(d => statuses[d.id] === 'open' || statuses[d.id] === 'escalated').reduce((s, d) => s + d.amount, 0).toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">In open disputes</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">Resolved</p>
          <p className="text-3xl font-extrabold text-emerald-700">{disputes.filter(d => statuses[d.id] === 'resolved' || statuses[d.id] === 'refunded').length}</p>
          <p className="text-slate-400 text-xs mt-1">Successfully closed</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'open', 'escalated', 'resolved', 'refunded'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border capitalize ${filter === s ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            {s}
            {s === 'open' && openCount > 0 && <span className="ml-1.5 bg-red-100 text-red-700 px-1 rounded-full">{openCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(dispute => {
          const status = statuses[dispute.id];
          const isActionable = status === 'open' || status === 'escalated';
          return (
            <div key={dispute.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${status === 'escalated' ? 'border-orange-200 bg-orange-50/20' : status === 'open' ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dispute.priority === 'high' ? 'bg-red-100 text-red-700' : dispute.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {dispute.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status === 'open' ? 'bg-red-50 text-red-700 border-red-200' : status === 'escalated' ? 'bg-orange-50 text-orange-700 border-orange-200' : status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{dispute.campaignTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                    <span className="font-medium text-violet-700">{dispute.creator}</span>
                    <span className="text-slate-300">vs</span>
                    <span className="font-medium text-blue-700">{dispute.brand}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">${dispute.amount.toLocaleString()} at stake</span>
                    <span className="text-slate-300">·</span>
                    <span>Opened {dispute.openedAt}</span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{dispute.reason}</p>
                </div>
                {isActionable && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(dispute.id, 'resolve')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors whitespace-nowrap"><CheckCircle size={12} /> Resolve</button>
                    <button onClick={() => handleAction(dispute.id, 'partial_payout')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg font-medium transition-colors whitespace-nowrap"><DollarSign size={12} /> Partial Payout</button>
                    <button onClick={() => handleAction(dispute.id, 'refund')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium transition-colors whitespace-nowrap"><RotateCcw size={12} /> Refund</button>
                    {status !== 'escalated' && <button onClick={() => handleAction(dispute.id, 'escalate')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap"><ArrowUpRight size={12} /> Escalate</button>}
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
