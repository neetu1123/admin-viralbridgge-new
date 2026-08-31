'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, CheckCircle, XCircle, Flag, Eye, Pause, AlertTriangle, X, Plus } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import { adminApi } from '@/src/lib/api';
import AdminCreateCampaignModal from './AdminCreateCampaignModal';

interface AdminCampaign {
  id: string;
  title: string;
  brand: string;
  platform: string;
  budget: number;
  status: 'pending_approval' | 'active' | 'completed' | 'flagged' | 'draft' | 'frozen' | 'rejected';
  applicants: number;
  createdAt: string;
  reportCount: number;
  contentBrief: string;
  creatorsInvolved: string[];
  flagReason?: string;
}

function mapAdminStatus(status: string): AdminCampaign['status'] {
  const s = (status || '').toUpperCase();
  if (s === 'PENDING_APPROVAL') return 'pending_approval';
  if (s === 'ACTIVE') return 'active';
  if (s === 'COMPLETED') return 'completed';
  if (s === 'FLAGGED') return 'flagged';
  if (s === 'REJECTED') return 'rejected';
  if (s === 'FROZEN') return 'frozen';
  return 'draft';
}

function mapAdminCampaign(raw: Record<string, unknown>): AdminCampaign {
  const brand = (raw.brand as Record<string, unknown>) ?? {};
  const apps = (raw.applications as unknown[]) ?? [];
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    brand: String(brand.company_name ?? 'Unknown brand'),
    platform: String(raw.platform ?? 'Instagram'),
    budget: Number(raw.budget) || 0,
    status: mapAdminStatus(String(raw.status ?? '')),
    applicants: apps.length || Number((raw._count as { applications?: number })?.applications) || 0,
    createdAt: String(raw.created_at ?? '').slice(0, 10),
    reportCount: raw.status === 'FLAGGED' ? 1 : 0,
    contentBrief: String(raw.description ?? ''),
    creatorsInvolved: [],
    flagReason: raw.status === 'FLAGGED' ? 'Flagged for review' : undefined,
  };
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending_approval: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  flagged: { label: 'Flagged', cls: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  frozen: { label: 'Frozen', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border border-red-300' },
};

export default function AdminCampaignsContent() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailCampaign, setDetailCampaign] = useState<AdminCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCampaigns();
      const list = Array.isArray(data) ? data : [];
      setCampaigns(list.map((c) => mapAdminCampaign(c as Record<string, unknown>)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    if (searchParams.get('create') === '1') setShowCreateModal(true);
  }, [searchParams]);

  const handleApprove = async (campaign: AdminCampaign) => {
    try {
      await adminApi.approveCampaign(campaign.id);
      toast.success(`Campaign approved: ${campaign.title}`);
      setDetailCampaign(null);
      await loadCampaigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Approve failed');
    }
  };

  const handleReject = async (campaign: AdminCampaign) => {
    try {
      await adminApi.rejectCampaign(campaign.id);
      toast.success(`Campaign rejected: ${campaign.title}`);
      setDetailCampaign(null);
      await loadCampaigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reject failed');
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = campaigns.filter((c) => c.status === 'pending_approval').length;
  const flagged = campaigns.filter((c) => c.status === 'flagged').length;
  const active = campaigns.filter((c) => c.status === 'active').length;
  const frozen = campaigns.filter((c) => c.status === 'frozen').length;

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Campaign Moderation</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading campaigns...' : 'Review, approve, flag, and manage all platform campaigns'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> Create Campaign for Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Pending Approval', value: pending, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Flagged', value: flagged, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Active', value: active, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Frozen', value: frozen, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="flagged">Flagged</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="frozen">Frozen</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Campaign', 'Brand', 'Platform', 'Budget', 'Status', 'Applicants', 'Reports', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{campaign.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Created {campaign.createdAt}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{campaign.brand}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <PlatformBadge platform={campaign.platform} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-800 tabular-nums">₹{campaign.budget.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig[campaign.status]?.cls}`}>
                      {statusConfig[campaign.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700 tabular-nums">{campaign.applicants}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {campaign.reportCount > 0 ? (
                      <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                        {campaign.reportCount} reports
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailCampaign(campaign)}
                        className="p-1.5 rounded-md hover:bg-violet-50 hover:text-violet-700 text-slate-500 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      {campaign.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(campaign)}
                            className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(campaign)}
                            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-500 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">No campaigns found</div>
          )}
        </div>
      </div>

      {detailCampaign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{detailCampaign.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {detailCampaign.brand} · ${detailCampaign.budget.toLocaleString()}
                </p>
              </div>
              <button onClick={() => setDetailCampaign(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Content Brief</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{detailCampaign.contentBrief}</p>
              </div>
              <div className="flex gap-2 pt-2">
                {detailCampaign.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleApprove(detailCampaign)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(detailCampaign)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDetailCampaign(null)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminCreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCampaigns}
      />
    </div>
  );
}
