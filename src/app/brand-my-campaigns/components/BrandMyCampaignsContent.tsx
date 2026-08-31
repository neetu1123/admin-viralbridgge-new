'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  Search,
  ChevronDown,
  Eye,
  Clock,
  CheckCircle,
  Briefcase,
  DollarSign,
  Users,
  Plus,
} from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import StatusBadge from '@/src/components/ui/StatusBadge';
import { brandApi } from '@/src/lib/api';
import { extractList, mapBrandCampaign, type BrandCampaignRow } from '@/src/lib/mappers';

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Clock },
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border border-slate-200', icon: Clock },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200', icon: CheckCircle },
};

function isActiveCampaignStatus(status: string) {
  return status === 'active' || status === 'in_progress';
}

export default function BrandMyCampaignsContent() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<BrandCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'active');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.getCampaigns({ limit: 100 });
      setCampaigns(extractList<Record<string, unknown>>(res).map(mapBrandCampaign));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const activeCount = campaigns.filter((c) => isActiveCampaignStatus(c.status)).length;
  const pendingApplicants = campaigns.reduce((s, c) => s + c.pending, 0);
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;
  const totalBudget = campaigns.filter((c) => isActiveCampaignStatus(c.status)).reduce((s, c) => s + c.budget, 0);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? isActiveCampaignStatus(c.status)
          : c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">My Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Your running, active, and completed brand campaigns</p>
        </div>
        <Link
          href="/brand-campaign-management/create"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Plus size={15} /> Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: activeCount, color: 'text-emerald-700', icon: CheckCircle },
          { label: 'Pending Applicants', value: pendingApplicants, color: 'text-amber-700', icon: Clock },
          { label: 'Completed', value: completedCount, color: 'text-violet-700', icon: Briefcase },
          { label: 'Active Budget', value: `₹${totalBudget.toLocaleString()}`, color: 'text-slate-800', icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={stat.color} />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
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
            <option value="active">Active Campaigns</option>
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} campaigns</span>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-500 text-sm">Loading campaigns...</div>
      )}

      <div className="space-y-3">
        {filtered.map((campaign) => {
          const sConfig = statusConfig[campaign.status] ?? statusConfig.active;
          const StatusIcon = sConfig.icon;
          return (
            <div
              key={campaign.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${
                campaign.status === 'active' || campaign.status === 'in_progress'
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-violet-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-slate-800">{campaign.title}</p>
                      {campaign.isDraft ? (
                        <StatusBadge status="draft" />
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sConfig.cls}`}>
                          <StatusIcon size={10} />
                          {sConfig.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {campaign.niche} · Created {campaign.createdAt} · Deadline {campaign.deadline}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <PlatformBadge platform={campaign.platform} />
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <DollarSign size={11} /> ₹{campaign.budget.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users size={11} /> {campaign.applicants} applicants · {campaign.accepted} accepted
                      </span>
                    </div>
                    {campaign.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {campaign.deliverables.map((d) => (
                          <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {campaign.isDraft && (
                    <Link
                      href={`/brand-campaign-management/create?edit=${campaign.id}`}
                      className="text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit Draft
                    </Link>
                  )}
                  <Link
                    href={`/analytics/campaigns/${campaign.id}`}
                    className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Analytics
                  </Link>
                  <Link
                    href={`/brand-applicant?campaign=${campaign.id}`}
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Applicants
                  </Link>
                  <Link
                    href={`/brand-deliverables?campaign=${campaign.id}`}
                    className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Deliverables
                  </Link>
                  <Link
                    href={`/brand-campaign-management?campaign=${campaign.id}`}
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye size={12} /> Dashboard
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Briefcase size={36} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-700 font-semibold mb-1">No campaigns found</h3>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or create a new campaign</p>
            <Link href="/brand-campaign-management/create" className="text-sm font-semibold text-violet-600">
              Create Campaign →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
