'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Lock, Unlock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { adminApi } from '@/src/lib/api';
import { mapAdminEscrows, type AdminEscrowRow } from '@/src/lib/mappers';

export default function EscrowContent() {
  const [items, setItems] = useState<AdminEscrowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getEscrows();
      setItems(mapAdminEscrows(data));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load escrows');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalLocked = items.filter(e => e.status === 'held').reduce((s, e) => s + e.amount, 0);
  const totalDisputed = items.filter(e => e.status === 'disputed').reduce((s, e) => s + e.amount, 0);

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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Escrow Management</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor and control funds locked in escrow across all campaigns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 text-white">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">Total Locked</p>
          <p className="text-3xl font-extrabold">₹{totalLocked.toLocaleString()}</p>
          <p className="text-violet-300 text-xs mt-1">{items.filter(e => e.status === 'held').length} active escrows</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
          <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-2">Disputed</p>
          <p className="text-3xl font-extrabold text-red-700">₹{totalDisputed.toLocaleString()}</p>
          <p className="text-red-500 text-xs mt-1">{items.filter(e => e.status === 'disputed').length} disputes active</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Escrows</p>
          <p className="text-3xl font-extrabold text-slate-800">{items.length}</p>
          <p className="text-slate-400 text-xs mt-1">Across all campaigns</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No escrow records yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">Escrow Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Campaign', 'Brand', 'Creator', 'Amount', 'Status', 'Locked At', 'Release Date'].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item.id} className={`hover:bg-slate-50/60 transition-colors ${item.status === 'disputed' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-800 max-w-[180px] truncate">{item.campaign}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{item.brand}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{item.creator}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800">₹{item.amount.toLocaleString()}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'held' ? 'bg-amber-50 text-amber-700 border border-amber-200' : item.status === 'disputed' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{item.lockedAt || '—'}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{item.releaseDate || '—'}</p></td>
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

