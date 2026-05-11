'use client';
import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const escrowItems = [
  { id: 'esc-001', campaign: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', creator: 'Sofia Martinez', amount: 6000, status: 'held', lockedAt: '2026-04-11', releaseDate: '2026-04-25' },
  { id: 'esc-002', campaign: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', creator: 'Jordan Osei', amount: 10500, status: 'held', lockedAt: '2026-04-08', releaseDate: '2026-04-30' },
  { id: 'esc-003', campaign: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', creator: 'Priya Nair', amount: 2800, status: 'held', lockedAt: '2026-04-03', releaseDate: '2026-04-28' },
  { id: 'esc-004', campaign: 'EcoBottle Zero-Waste Push', brand: 'EcoBottle', creator: 'Mei-Lin Chen', amount: 3200, status: 'disputed', lockedAt: '2026-04-05', releaseDate: '2026-04-20' },
  { id: 'esc-005', campaign: 'TechDrop Earbuds Review', brand: 'TechDrop', creator: 'Aisha Okonkwo', amount: 6400, status: 'disputed', lockedAt: '2026-04-04', releaseDate: '2026-04-18' },
  { id: 'esc-006', campaign: 'GameVault Pro Controller', brand: 'GameVault', creator: 'Marcus Webb', amount: 5400, status: 'held', lockedAt: '2026-03-28', releaseDate: '2026-04-22' },
];

export default function EscrowContent() {
  const [statuses, setStatuses] = useState<Record<string, string>>(Object.fromEntries(escrowItems.map(e => [e.id, e.status])));

  const totalLocked = escrowItems.filter(e => statuses[e.id] === 'held').reduce((s, e) => s + e.amount, 0);
  const totalDisputed = escrowItems.filter(e => statuses[e.id] === 'disputed').reduce((s, e) => s + e.amount, 0);

  const handleAction = (id: string, action: 'release' | 'hold') => {
    setStatuses(prev => ({ ...prev, [id]: action === 'release' ? 'released' : 'held' }));
    toast.success(action === 'release' ? 'Escrow released to creator' : 'Funds placed on hold');
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Escrow Management</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor and control funds locked in escrow across all campaigns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 text-white">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">Total Locked</p>
          <p className="text-3xl font-extrabold">₹{totalLocked.toLocaleString()}</p>
          <p className="text-violet-300 text-xs mt-1">{escrowItems.filter(e => statuses[e.id] === 'held').length} active escrows</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
          <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-2">Disputed</p>
          <p className="text-3xl font-extrabold text-red-700">₹{totalDisputed.toLocaleString()}</p>
          <p className="text-red-500 text-xs mt-1">{escrowItems.filter(e => statuses[e.id] === 'disputed').length} disputes active</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Total Campaigns</p>
          <p className="text-3xl font-extrabold text-slate-800">{escrowItems.length}</p>
          <p className="text-slate-400 text-xs mt-1">Across all active escrows</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700">Escrow Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Campaign', 'Brand', 'Creator', 'Amount', 'Status', 'Locked At', 'Release Date', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {escrowItems.map(item => {
                const status = statuses[item.id];
                return (
                  <tr key={item.id} className={`hover:bg-slate-50/60 transition-colors group ${status === 'disputed' ? 'bg-red-50/20' : ''}`}>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-800 max-w-[180px] truncate">{item.campaign}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{item.brand}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{item.creator}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800">₹{item.amount.toLocaleString()}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status === 'held' ? 'bg-amber-50 text-amber-700 border border-amber-200' : status === 'disputed' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{item.lockedAt}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{item.releaseDate}</p></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {status === 'held' && <button onClick={() => handleAction(item.id, 'release')} className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"><Unlock size={12} /> Release</button>}
                        {status === 'released' && <button onClick={() => handleAction(item.id, 'hold')} className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors"><Lock size={12} /> Hold</button>}
                        {status === 'disputed' && <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle size={12} /> Dispute Active</span>}
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
