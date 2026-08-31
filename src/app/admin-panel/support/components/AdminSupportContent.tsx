'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { Loader2, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/src/lib/useAuth';
import { adminSupportApi } from '@/src/lib/api';
import type { SupportCase, SupportSummary } from '@/src/lib/support/types';
import SupportStatusBadge from '@/src/components/support/SupportStatusBadge';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'high', label: 'High Priority' },
  { id: 'payment', label: 'Payment' },
  { id: 'technical', label: 'Technical' },
  { id: 'resolved', label: 'Resolved' },
];

export default function AdminSupportContent() {
  const { loading: authLoading } = useAuth('admin');
  const [summary, setSummary] = useState<SupportSummary | null>(null);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, casesData] = await Promise.all([
        adminSupportApi.getSummary(),
        adminSupportApi.getCases({ tab, search: search || undefined, limit: 50 }),
      ]);
      setSummary(summaryData);
      setCases(casesData.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load support cases');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    load();
  }, [load]);

  if (authLoading || (loading && !summary)) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-center gap-2 mb-6">
        <LifeBuoy className="text-violet-600" size={24} />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Support Cases</h1>
          <p className="text-sm text-slate-500">Manage brand and creator support requests</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Open Cases', value: summary.openCases, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'High Priority', value: summary.highPriority, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Unassigned', value: summary.unassigned, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Waiting for User', value: summary.waitingForUser, color: 'text-indigo-700', bg: 'bg-indigo-50' },
            { label: 'Resolved Today', value: summary.resolvedToday, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-slate-200 rounded-xl p-4`}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cases..."
        className="w-full max-w-md mb-4 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="animate-spin text-violet-600 mx-auto" size={24} /></div>
        ) : cases.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No cases found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Case #</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Subject</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Updated</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin-panel/support/${c.id}`} className="font-mono text-violet-600 hover:underline">{c.caseNumber}</Link>
                    </td>
                    <td className="px-4 py-3">{c.userName}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{c.userRole}</span></td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-4 py-3">{c.priority}</td>
                    <td className="px-4 py-3"><SupportStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(c.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
