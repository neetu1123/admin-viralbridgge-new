'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, BarChart3, Eye, Loader2, TrendingUp, Users } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList } from '@/src/lib/mappers';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

interface CampaignAnalyticsRow {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'completed' | 'draft' | 'in_progress';
  budget: number;
  spent: number;
  applicants: number;
  accepted: number;
  reach: number;
  engagement: number;
  reachFactor: number;
}

function mapCampaignRow(raw: Record<string, unknown>): CampaignAnalyticsRow {
  const budget = Number(raw.budget) || 0;
  const spent = Number(raw.spent ?? raw.total_spent) || 0;
  const applicants = Number(raw.applicants_count ?? raw.applicants) || 0;
  const accepted = Number(raw.accepted_count ?? raw.accepted) || 0;
  const statusRaw = String(raw.status ?? 'active').toLowerCase();
  let status: CampaignAnalyticsRow['status'] = 'active';
  if (statusRaw === 'completed') status = 'completed';
  else if (statusRaw === 'draft') status = 'draft';
  else if (statusRaw === 'in_progress') status = 'in_progress';

  return {
    id: String(raw.id),
    name: String(raw.title ?? 'Campaign'),
    platform: String(raw.platform ?? 'Instagram'),
    status,
    budget,
    spent,
    applicants,
    accepted,
    reach: budget * 20 || Math.max(applicants * 1200, 5000),
    engagement: accepted > 0 ? Math.min(6 + accepted * 0.4, 12) : 3.5,
    reachFactor: budget > 0 ? Number((2 + spent / Math.max(budget, 1)).toFixed(1)) : 2,
  };
}

export default function BrandCampaignAnalyticsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignAnalyticsRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.getCampaigns({ limit: 50 });
      const rows = extractList<Record<string, unknown>>(res)
        .filter((c) => String(c.status ?? '').toUpperCase() !== 'COMPLETED')
        .map(mapCampaignRow)
        .sort((a, b) => b.reach - a.reach);
      setCampaigns(rows);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = campaigns.slice(0, 8).map((c) => ({
    id: c.id,
    name: c.name.length > 14 ? `${c.name.slice(0, 14)}…` : c.name,
    reach: c.reach,
  }));

  const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalApplicants = campaigns.reduce((s, c) => s + c.applicants, 0);
  const avgReachFactor =
    campaigns.length > 0
      ? (campaigns.reduce((s, c) => s + c.reachFactor, 0) / campaigns.length).toFixed(1)
      : '0';

  const openCampaignAnalytics = (id: string) => {
    router.push(`/analytics/campaigns/${id}`);
  };

  return (
    <div className="pb-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 mb-2"
          >
            <ArrowLeft size={14} /> Back to Analytics Overview
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-violet-600" size={24} />
            Campaign Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Performance metrics for each campaign — click a campaign to view its analytics
          </p>
        </div>
        <Link
          href="/brand-my-campaigns"
          className="text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-lg bg-white"
        >
          Manage Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: String(campaigns.length), icon: Eye, color: 'text-blue-700' },
          { label: 'Total Applicants', value: String(totalApplicants), icon: Users, color: 'text-emerald-700' },
          { label: 'Total Spend', value: `₹${totalSpend.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-700' },
          { label: 'Avg Reach Factor', value: `${avgReachFactor}x`, icon: BarChart3, color: 'text-amber-700' },
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-600 font-semibold mb-2">No active campaigns to analyze</p>
          <Link href="/brand-campaign-management/create" className="text-sm text-violet-600 font-semibold">
            Create your first campaign →
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Top Performing Campaigns</h2>
            <p className="text-xs text-slate-400 mb-4">Click a bar to view that campaign&apos;s analytics</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`${(v / 1000).toFixed(1)}K`, 'Reach']} />
                <Bar
                  dataKey="reach"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    const payload = data as { id?: string };
                    if (payload?.id) openCampaignAnalytics(payload.id);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">All Campaign Performance</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {campaigns.map((c, i) => (
                <div
                  key={c.id}
                  className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-700 text-xs font-bold">{i + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                          <StatusBadge status={c.status} />
                          <PlatformBadge platform={c.platform} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Reach: {(c.reach / 1000).toFixed(0)}K</span>
                          <span>Engagement: {c.engagement.toFixed(1)}%</span>
                          <span>Reach factor: {c.reachFactor}x</span>
                          <span>Applicants: {c.applicants}</span>
                          <span>Accepted: {c.accepted}</span>
                          <span>Budget: ₹{c.budget.toLocaleString()}</span>
                          <span>Spent: ₹{c.spent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/analytics/campaigns/${c.id}`}
                        className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
