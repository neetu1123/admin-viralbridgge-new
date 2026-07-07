'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import { adminApi } from '@/src/lib/api';
import { mapFlaggedCampaigns, type FlaggedCampaignRow } from '@/src/lib/mappers';

export default function FlaggedContent() {
  const [items, setItems] = useState<FlaggedCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFlaggedCampaigns();
      setItems(mapFlaggedCampaigns(data));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load flagged campaigns');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActingId(id);
    try {
      if (action === 'approve') {
        await adminApi.approveCampaign(id);
        toast.success('Campaign approved and restored');
      } else {
        await adminApi.rejectCampaign(id);
        toast.success('Campaign rejected');
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
        <h1 className="text-2xl font-bold text-slate-800">Flagged Content</h1>
        <p className="text-slate-500 text-sm mt-1">Review campaigns flagged for policy violations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-2 border-red-300 p-5">
          <p className="text-red-700 text-xs font-bold uppercase tracking-wide mb-2">Critical Flags</p>
          <p className="text-3xl font-extrabold text-red-700">{items.filter(f => f.severity === 'critical').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-5">
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">Total Flagged</p>
          <p className="text-3xl font-extrabold text-amber-700">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Reports</p>
          <p className="text-3xl font-extrabold text-slate-800">{items.reduce((s, f) => s + f.reportCount, 0)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No flagged campaigns — all clear.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm ${item.severity === 'critical' ? 'border-red-300' : 'border-amber-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.severity.toUpperCase()}
                    </span>
                    <PlatformBadge platform={item.platform} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{item.brand} · Budget: ₹{item.budget.toLocaleString()} · Flagged {item.flaggedAt}</p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Flag Reason</p>
                    <p className="text-sm text-red-700">{item.flagReason}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    disabled={actingId === item.id}
                    onClick={() => handleAction(item.id, 'approve')}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button
                    disabled={actingId === item.id}
                    onClick={() => handleAction(item.id, 'reject')}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
