'use client';
import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';

const auditLogs = [
  { id: 'log-001', admin: 'Admin User', action: 'Banned account', target: 'SpamBrand LLC (usr-007)', module: 'Users', timestamp: '2026-04-14 14:32:11', severity: 'high' },
  { id: 'log-002', admin: 'Raj Patel', action: 'Released escrow payment', target: 'Sofia Martinez — $1,200', module: 'Finance', timestamp: '2026-04-13 11:18:44', severity: 'medium' },
  { id: 'log-003', admin: 'Zara Ahmed', action: 'Rejected campaign', target: 'Suspicious Crypto Giveaway (camp-003)', module: 'Moderation', timestamp: '2026-04-13 09:45:22', severity: 'high' },
  { id: 'log-004', admin: 'Admin User', action: 'Approved withdrawal', target: 'Daniela Rossi — $2,200', module: 'Finance', timestamp: '2026-04-12 16:20:05', severity: 'low' },
  { id: 'log-005', admin: 'Tom Chen', action: 'Viewed activity log', target: 'TechDrop (usr-004)', module: 'Users', timestamp: '2026-04-12 14:10:33', severity: 'low' },
  { id: 'log-006', admin: 'Zara Ahmed', action: 'Escalated dispute', target: 'GameVault Pro Controller (dsp-003)', module: 'Moderation', timestamp: '2026-04-11 10:55:18', severity: 'high' },
  { id: 'log-007', admin: 'Raj Patel', action: 'Held escrow funds', target: 'EcoBottle Zero-Waste Push — $3,200', module: 'Finance', timestamp: '2026-04-10 15:30:47', severity: 'medium' },
  { id: 'log-008', admin: 'Admin User', action: 'Suspended account', target: 'TechDrop (usr-004)', module: 'Users', timestamp: '2026-04-10 09:12:55', severity: 'high' },
  { id: 'log-009', admin: 'Zara Ahmed', action: 'Resolved dispute', target: 'NomadPay Travel Creator Push (dsp-004)', module: 'Moderation', timestamp: '2026-04-09 13:44:22', severity: 'medium' },
  { id: 'log-010', admin: 'Admin User', action: 'Force matched creator', target: 'Jordan Osei → FitPro Challenge', module: 'AI Matching', timestamp: '2026-04-08 11:20:10', severity: 'low' },
];

const severityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border border-red-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-slate-100 text-slate-600',
};

const moduleColors: Record<string, string> = {
  Users: 'bg-blue-50 text-blue-700',
  Finance: 'bg-emerald-50 text-emerald-700',
  Moderation: 'bg-red-50 text-red-700',
  'AI Matching': 'bg-violet-50 text-violet-700',
  System: 'bg-slate-100 text-slate-600',
};

export default function AuditLogsContent() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = auditLogs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) || log.admin.toLowerCase().includes(search.toLowerCase()) || log.target.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Complete record of all admin actions across the platform</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white" />
          </div>
          <div className="relative">
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Modules</option>
              <option value="Users">Users</option>
              <option value="Finance">Finance</option>
              <option value="Moderation">Moderation</option>
              <option value="AI Matching">AI Matching</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Timestamp', 'Admin', 'Action', 'Target', 'Module', 'Severity'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs font-mono text-slate-500">{log.timestamp}</p></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{log.admin.slice(0, 1)}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{log.admin}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-700">{log.action}</p></td>
                  <td className="px-5 py-3.5"><p className="text-sm text-slate-500 max-w-[200px] truncate">{log.target}</p></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${moduleColors[log.module] ?? 'bg-slate-100 text-slate-600'}`}>{log.module}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColors[log.severity]}`}>{log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
