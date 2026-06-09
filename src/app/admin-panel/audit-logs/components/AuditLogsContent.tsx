'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Filter, RefreshCw, X, Shield, Activity, Clock, Database, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { auditApi, AuditLogEntry, AuditLogStats } from '@/src/lib/api';

// ─── Mock fallback ─────────────────────────────────────────────────────────────
const MOCK_LOGS: AuditLogEntry[] = [
  { id: '1', admin_id: 'a1', action: 'BAN_USER', entity: 'User', entity_id: 'usr-007', metadata: { banned: true }, created_at: '2026-04-14T14:32:11Z', admin: { id: 'a1', name: 'Admin User', email: 'admin@viralbridgge.io' } },
  { id: '2', admin_id: 'a2', action: 'APPROVE_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-005', metadata: { status: 'ACTIVE' }, created_at: '2026-04-13T11:18:44Z', admin: { id: 'a2', name: 'Raj Patel', email: 'raj@viralbridgge.io' } },
  { id: '3', admin_id: 'a3', action: 'REJECT_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-003', metadata: { status: 'REJECTED' }, created_at: '2026-04-13T09:45:22Z', admin: { id: 'a3', name: 'Zara Ahmed', email: 'zara@viralbridgge.io' } },
  { id: '4', admin_id: 'a1', action: 'UPDATE_USER_ROLE', entity: 'User', entity_id: 'usr-005', metadata: { role_id: 'creator' }, created_at: '2026-04-12T16:20:05Z', admin: { id: 'a1', name: 'Admin User', email: 'admin@viralbridgge.io' } },
  { id: '5', admin_id: 'a4', action: 'FLAG_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-003', metadata: { reason: 'Fraudulent giveaway' }, created_at: '2026-04-12T14:10:33Z', admin: { id: 'a4', name: 'Tom Chen', email: 'tom@viralbridgge.io' } },
  { id: '6', admin_id: 'a3', action: 'UNBAN_USER', entity: 'User', entity_id: 'usr-010', metadata: { banned: false }, created_at: '2026-04-11T10:55:18Z', admin: { id: 'a3', name: 'Zara Ahmed', email: 'zara@viralbridgge.io' } },
  { id: '7', admin_id: 'a2', action: 'BAN_USER', entity: 'User', entity_id: 'usr-004', metadata: { banned: true }, created_at: '2026-04-10T15:30:47Z', admin: { id: 'a2', name: 'Raj Patel', email: 'raj@viralbridgge.io' } },
  { id: '8', admin_id: 'a1', action: 'APPROVE_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-006', metadata: { status: 'ACTIVE' }, created_at: '2026-04-10T09:12:55Z', admin: { id: 'a1', name: 'Admin User', email: 'admin@viralbridgge.io' } },
  { id: '9', admin_id: 'a3', action: 'UPDATE_USER_ROLE', entity: 'User', entity_id: 'usr-003', metadata: { role_id: 'brand' }, created_at: '2026-04-09T13:44:22Z', admin: { id: 'a3', name: 'Zara Ahmed', email: 'zara@viralbridgge.io' } },
  { id: '10', admin_id: 'a4', action: 'FLAG_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-007', metadata: { reason: 'Suspicious activity' }, created_at: '2026-04-08T11:20:10Z', admin: { id: 'a4', name: 'Tom Chen', email: 'tom@viralbridgge.io' } },
  { id: '11', admin_id: 'a1', action: 'REJECT_CAMPAIGN', entity: 'Campaign', entity_id: 'camp-008', metadata: { status: 'REJECTED' }, created_at: '2026-04-07T09:10:00Z', admin: { id: 'a1', name: 'Admin User', email: 'admin@viralbridgge.io' } },
  { id: '12', admin_id: 'a2', action: 'BAN_USER', entity: 'User', entity_id: 'usr-001', metadata: { banned: true }, created_at: '2026-04-06T18:05:30Z', admin: { id: 'a2', name: 'Raj Patel', email: 'raj@viralbridgge.io' } },
];

const MOCK_STATS: AuditLogStats = { total: 248, today: 12, byEntity: [{ entity: 'User', _count: { entity: 102 } }, { entity: 'Campaign', _count: { entity: 89 } }, { entity: 'Transaction', _count: { entity: 57 } }] };

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ACTION_META: Record<string, { label: string; color: string; entity: string }> = {
  BAN_USER:         { label: 'Ban User',          color: 'bg-red-100 text-red-700 border border-red-200',      entity: 'User' },
  UNBAN_USER:       { label: 'Unban User',         color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', entity: 'User' },
  UPDATE_USER_ROLE: { label: 'Update Role',        color: 'bg-blue-100 text-blue-700 border border-blue-200',  entity: 'User' },
  APPROVE_CAMPAIGN: { label: 'Approve Campaign',   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', entity: 'Campaign' },
  REJECT_CAMPAIGN:  { label: 'Reject Campaign',    color: 'bg-red-100 text-red-700 border border-red-200',     entity: 'Campaign' },
  FLAG_CAMPAIGN:    { label: 'Flag Campaign',      color: 'bg-orange-100 text-orange-700 border border-orange-200', entity: 'Campaign' },
  RELEASE_PAYMENT:  { label: 'Release Payment',    color: 'bg-violet-100 text-violet-700 border border-violet-200', entity: 'Transaction' },
  CREATE_CAMPAIGN:  { label: 'Create Campaign',    color: 'bg-violet-100 text-violet-700 border border-violet-200', entity: 'Campaign' },
  UPDATE_CAMPAIGN:  { label: 'Update Campaign',    color: 'bg-blue-100 text-blue-700 border border-blue-200', entity: 'Campaign' },
  DELETE_CAMPAIGN:  { label: 'Delete Campaign',    color: 'bg-red-100 text-red-700 border border-red-200', entity: 'Campaign' },
  APPROVE_APPLICATION: { label: 'Approve Application', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', entity: 'Application' },
  REJECT_APPLICATION:  { label: 'Reject Application',  color: 'bg-red-100 text-red-700 border border-red-200', entity: 'Application' },
  SHORTLIST_APPLICATION: { label: 'Shortlist Application', color: 'bg-amber-100 text-amber-700 border border-amber-200', entity: 'Application' },
  APPLY_CAMPAIGN:   { label: 'Apply to Campaign',  color: 'bg-indigo-100 text-indigo-700 border border-indigo-200', entity: 'Application' },
  UPDATE_BRAND_PROFILE: { label: 'Update Brand Profile', color: 'bg-slate-100 text-slate-700 border border-slate-200', entity: 'Brand' },
  UPDATE_CREATOR_PROFILE: { label: 'Update Creator Profile', color: 'bg-slate-100 text-slate-700 border border-slate-200', entity: 'Creator' },
  SUBMIT_DELIVERABLE: { label: 'Submit Deliverable', color: 'bg-teal-100 text-teal-700 border border-teal-200', entity: 'Deliverable' },
};

const ENTITY_COLORS: Record<string, string> = {
  User:        'bg-blue-50 text-blue-700',
  Campaign:    'bg-violet-50 text-violet-700',
  Transaction: 'bg-emerald-50 text-emerald-700',
  Dispute:     'bg-orange-50 text-orange-700',
};

function actionLabel(action: string) { return ACTION_META[action]?.label ?? action.replace(/_/g, ' '); }
function actionColor(action: string) { return ACTION_META[action]?.color ?? 'bg-slate-100 text-slate-600'; }
function entityColor(entity: string) { return ENTITY_COLORS[entity] ?? 'bg-slate-100 text-slate-600'; }

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function avatarInitial(name: string) { return name?.charAt(0)?.toUpperCase() ?? '?'; }

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ log, onClose }: { log: AuditLogEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Audit Log Detail</h3>
              <p className="text-xs text-slate-500 font-mono">{log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          {/* Action */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${actionColor(log.action)}`}>{actionLabel(log.action)}</span>
          </div>

          {/* Actor */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actor</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{avatarInitial(log.admin?.name)}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{log.admin?.name}</p>
                <p className="text-xs text-slate-400">{log.admin?.email}</p>
              </div>
            </div>
          </div>

          {/* Entity */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entity</span>
            <div className="text-right">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entityColor(log.entity)}`}>{log.entity}</span>
              <p className="text-xs text-slate-400 font-mono mt-1">{log.entity_id}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Timestamp</span>
            <p className="text-sm text-slate-700 font-mono">{fmtDate(log.created_at)}</p>
          </div>

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metadata</p>
              <pre className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button onClick={onClose} className="mt-5 w-full py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">Close</button>
      </div>
    </div>
  );
}

// ─── Stats Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800 tabular-nums mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AuditLogsContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_LOGS);
  const [stats, setStats] = useState<AuditLogStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(MOCK_LOGS.length);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const loadData = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        auditApi.getLogs({
          page: pg,
          limit: 15,
          entity: entityFilter !== 'all' ? entityFilter : undefined,
          action: actionFilter !== 'all' ? actionFilter : undefined,
        }),
        auditApi.getStats(),
      ]);
      setLogs(logsRes.data);
      setTotalPages(logsRes.totalPages);
      setTotal(logsRes.total);
      setStats(statsRes);
      setUsingMock(false);
    } catch {
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter]);

  useEffect(() => { setPage(1); loadData(1); }, [loadData]);

  const handlePageChange = (p: number) => { setPage(p); loadData(p); };

  // Client-side search on current page results
  const filtered = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entity_id.toLowerCase().includes(q) ||
      log.admin?.name?.toLowerCase().includes(q) ||
      log.admin?.email?.toLowerCase().includes(q)
    );
  });

  // CSV Export
  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Admin', 'Admin Email', 'Action', 'Entity', 'Entity ID', 'Metadata'];
    const rows = filtered.map(l => [
      l.id, fmtDate(l.created_at), l.admin?.name, l.admin?.email,
      actionLabel(l.action), l.entity, l.entity_id,
      JSON.stringify(l.metadata ?? {}),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit-logs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const topEntity = stats.byEntity[0];

  return (
    <div className="pb-8">
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield size={22} className="text-violet-600" /> Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">Every admin action across the platform — who did what, when</p>
          {usingMock && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              ⚠ Showing demo data — backend not connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadData(page)} className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Activity size={18} className="text-violet-600" />} label="Total Logs" value={stats.total.toLocaleString()} sub="All time" color="bg-violet-50" />
        <StatCard icon={<Clock size={18} className="text-blue-600" />} label="Today" value={stats.today} sub="Actions today" color="bg-blue-50" />
        <StatCard icon={<Database size={18} className="text-emerald-600" />} label="Top Entity" value={topEntity?.entity ?? '—'} sub={`${topEntity?._count?.entity ?? 0} entries`} color="bg-emerald-50" />
        <StatCard icon={<Shield size={18} className="text-orange-600" />} label="This Page" value={filtered.length} sub={`of ${total} total`} color="bg-orange-50" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search action, admin, entity..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
            />
          </div>
          <div className="relative">
            <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Entities</option>
              <option value="User">User</option>
              <option value="Campaign">Campaign</option>
              <option value="Transaction">Transaction</option>
              <option value="Dispute">Dispute</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Actions</option>
              <option value="BAN_USER">Ban User</option>
              <option value="UNBAN_USER">Unban User</option>
              <option value="UPDATE_USER_ROLE">Update Role</option>
              <option value="APPROVE_CAMPAIGN">Approve Campaign</option>
              <option value="REJECT_CAMPAIGN">Reject Campaign</option>
              <option value="FLAG_CAMPAIGN">Flag Campaign</option>
            </select>
            <Filter size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Shield size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No audit logs found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Timestamp', 'Admin', 'Action', 'Entity', 'Entity ID', ''].map(col => (
                    <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-xs font-mono text-slate-500">{fmtDate(log.created_at)}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{avatarInitial(log.admin?.name)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 leading-tight">{log.admin?.name}</p>
                          <p className="text-xs text-slate-400">{log.admin?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${actionColor(log.action)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entityColor(log.entity)}`}>{log.entity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-mono text-slate-400 max-w-[140px] truncate">{log.entity_id}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 transition-all font-medium"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!usingMock && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {page} of {totalPages} · {total} total entries</p>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-violet-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
