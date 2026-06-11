'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Scale, RefreshCw } from 'lucide-react';
import { brandApi, creatorApi } from '@/src/lib/api';
import { mapUserDisputes, type UserDisputeRow } from '@/src/lib/mappers';

const statusStyles: Record<UserDisputeRow['status'], string> = {
  open: 'bg-red-50 text-red-700 border-red-200',
  escalated: 'bg-orange-50 text-orange-700 border-orange-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusLabels: Record<UserDisputeRow['status'], string> = {
  open: 'Under review',
  escalated: 'Escalated',
  resolved: 'Resolved',
  refunded: 'Refunded',
};

interface MyDisputesPanelProps {
  role: 'brand' | 'creator';
  refreshKey?: number;
}

export default function MyDisputesPanel({ role, refreshKey = 0 }: MyDisputesPanelProps) {
  const [disputes, setDisputes] = useState<UserDisputeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = role === 'brand' ? await brandApi.getDisputes() : await creatorApi.getDisputes();
      setDisputes(mapUserDisputes(data));
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm text-slate-400">Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-700">My Disputes</h2>
        </div>
        <button
          onClick={load}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-slate-500">No disputes yet</p>
          <p className="text-xs text-slate-400 mt-1">Issues you raise will appear here with status updates</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {disputes.map((d) => (
            <div key={d.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{d.campaignTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {role === 'brand' ? d.creator : d.brand} · ₹{d.amount.toLocaleString()} · Opened {d.openedAt}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{d.reason}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${statusStyles[d.status]}`}>
                  {statusLabels[d.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
