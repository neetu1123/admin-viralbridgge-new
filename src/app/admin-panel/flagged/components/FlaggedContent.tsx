'use client';
import React, { useState } from 'react';
import { Flag, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

const flaggedItems = [
  { id: 'camp-003', title: 'Suspicious Crypto Giveaway', brand: 'SpamBrand LLC', platform: 'Instagram', budget: 500, reportCount: 8, flagReason: 'Fraudulent giveaway scheme — 8 user reports, violates financial promotion policy', flaggedAt: '2026-03-02', severity: 'critical' },
  { id: 'camp-007', title: 'GameVault Pro Controller', brand: 'GameVault', platform: 'TikTok', budget: 5400, reportCount: 1, flagReason: 'Unverified product claims — 1 report from creator regarding misleading specs', flaggedAt: '2026-04-01', severity: 'low' },
];

export default function FlaggedContent() {
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(flaggedItems.map(f => [f.id, 'flagged'])));

  const handleAction = (id: string, action: 'approve' | 'reject' | 'freeze') => {
    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'frozen';
    setStatuses(prev => ({ ...prev, [id]: newStatus }));
    const labels: Record<string, string> = { approve: 'Campaign approved and restored', reject: 'Campaign rejected and removed', freeze: 'Campaign frozen pending review' };
    toast.success(labels[action]);
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Flagged Content</h1>
        <p className="text-slate-500 text-sm mt-1">Review campaigns flagged by AI or user reports for policy violations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-red-300 p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 animate-pulse" />
          <p className="text-red-700 text-xs font-bold uppercase tracking-wide mb-2">Critical Flags</p>
          <p className="text-3xl font-extrabold text-red-700">{flaggedItems.filter(f => f.severity === 'critical').length}</p>
          <p className="text-red-500 text-xs mt-1">Immediate action required</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-5">
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">Total Flagged</p>
          <p className="text-3xl font-extrabold text-amber-700">{flaggedItems.length}</p>
          <p className="text-slate-400 text-xs mt-1">Awaiting review</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Reports</p>
          <p className="text-3xl font-extrabold text-slate-800">{flaggedItems.reduce((s, f) => s + f.reportCount, 0)}</p>
          <p className="text-slate-400 text-xs mt-1">User-submitted reports</p>
        </div>
      </div>

      <div className="space-y-4">
        {flaggedItems.map(item => {
          const status = statuses[item.id];
          const isActionable = status === 'flagged';
          return (
            <div key={item.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm ${item.severity === 'critical' ? 'border-red-300' : 'border-amber-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.severity.toUpperCase()}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Flagged</span>
                    <PlatformBadge platform={item.platform} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{item.brand} · Budget: ₹{item.budget.toLocaleString()} · {item.reportCount} report{item.reportCount !== 1 ? 's' : ''} · Flagged {item.flaggedAt}</p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Flag Reason</p>
                    <p className="text-sm text-red-700">{item.flagReason}</p>
                  </div>
                </div>
                {isActionable && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(item.id, 'approve')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors whitespace-nowrap"><CheckCircle size={12} /> Approve</button>
                    <button onClick={() => handleAction(item.id, 'reject')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap"><XCircle size={12} /> Reject</button>
                    <button onClick={() => handleAction(item.id, 'freeze')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors whitespace-nowrap"><Lock size={12} /> Freeze</button>
                  </div>
                )}
                {!isActionable && (
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${status === 'approved' ? 'bg-emerald-50 text-emerald-700' : status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
