'use client';

import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import {
  MOCK_BROADCAST_RECIPIENTS,
  USER_STATUS_OPTIONS,
  filterRecipientsByStatus,
  type MockBroadcastRecipient,
  type UserStatusFilter,
} from '@/src/lib/mock/broadcastRecipients';

function statusBadgeClass(status: MockBroadcastRecipient['status']) {
  if (status === 'Inactive') return 'bg-slate-100 text-slate-600 border-slate-200';
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Verified') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

interface BroadcastRecipientPanelProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
}

export default function BroadcastRecipientPanel({
  selectedIds,
  onToggle,
  onToggleAll,
}: BroadcastRecipientPanelProps) {
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterRecipientsByStatus(MOCK_BROADCAST_RECIPIENTS, statusFilter, search),
    [statusFilter, search],
  );

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 h-full">
      <div>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Users size={16} className="text-violet-600" />
          Recipient Preview
        </h2>
        <p className="text-xs text-slate-500 mt-1">Mock recipient targeting — frontend only</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">User Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          {USER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>

      <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-violet-600 font-semibold uppercase tracking-wide">Selected Recipients</p>
          <p className="text-2xl font-black text-violet-800 tabular-nums">{selectedIds.size}</p>
        </div>
        <p className="text-xs text-violet-600">{filtered.length} matching filter</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 px-1">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onToggleAll(filtered.map((r) => r.id), e.target.checked)}
        />
        Select all visible ({filtered.length})
      </label>

      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {filtered.map((recipient) => (
          <label
            key={recipient.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(recipient.id)}
              onChange={() => onToggle(recipient.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-800 truncate">{recipient.name}</p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass(recipient.status)}`}
                  title={recipient.status === 'Inactive' ? 'No activity detected within the configured inactivity period.' : undefined}
                >
                  {recipient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{recipient.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{recipient.role} · {recipient.location} · Last active {recipient.lastActive}</p>
            </div>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No users match your filters.</p>
        )}
      </div>
    </div>
  );
}
