'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, BarChart3, Eye, Loader2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

interface CampaignDetail {
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
  description?: string;
  deadline?: string;
}

function mapCampaignDetail(raw: Record<string, unknown>): CampaignDetail {
  const budget = Number(raw.budget) || 0;
  const spent = Number(raw.spent ?? raw.total_spent) || 0;
  const applicants = Number(raw.applicants_count ?? raw.applicants) || 0;
  const accepted = Number(raw.accepted_count ?? raw.accepted) || 0;
  const statusRaw = String(raw.status ?? 'active').toUpperCase();
  let status: CampaignDetail['status'] = 'active';
  if (statusRaw === 'COMPLETED') status = 'completed';
  else if (statusRaw === 'DRAFT') status = 'draft';
  else if (statusRaw === 'IN_PROGRESS') status = 'in_progress';

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
    description: raw.description ? String(raw.description) : undefined,
    deadline: raw.deadline ? String(raw.deadline).slice(0, 10) : undefined,
  };
}

export default function CampaignAnalyticsDetailContent() {
  const params = useParams();
  const campaignId = String(params.campaignId ?? '');
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await brandApi.getCampaign(campaignId);
      setCampaign(mapCampaignDetail(raw as Record<string, unknown>));
    } catch {
      setError('Campaign not found or failed to load analytics.');
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = campaign
    ? [
        { label: 'Reach', value: campaign.reach },
        { label: 'Applicants', value: campaign.applicants * 500 },
        { label: 'Accepted', value: campaign.accepted * 800 },
        { label: 'Spent', value: campaign.spent },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="pb-8">
        <Link href="/analytics/campaigns" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 mb-4">
          <ArrowLeft size={14} /> Back to Campaign Analytics
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-600 font-semibold mb-2">{error ?? 'Campaign not found'}</p>
          <Link href="/brand-my-campaigns" className="text-sm text-violet-600 font-semibold">
            Go to My Campaigns →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link
            href="/analytics/campaigns"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 mb-2"
          >
            <ArrowLeft size={14} /> Back to Campaign Analytics
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-violet-600" size={24} />
            {campaign.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <PlatformBadge platform={campaign.platform} />
            <StatusBadge status={campaign.status} />
            {campaign.deadline && (
              <span className="text-xs text-slate-500">Deadline: {campaign.deadline}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/brand-my-campaigns`}
            className="text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-lg bg-white"
          >
            My Campaigns
          </Link>
          <Link
            href={`/brand-applicant?campaign=${campaign.id}`}
            className="text-sm font-semibold text-violet-700 border border-violet-200 px-4 py-2 rounded-lg bg-violet-50 hover:bg-violet-100"
          >
            View Applicants
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 mb-6 text-white shadow-lg">
        <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-3">Campaign Performance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-violet-200 text-xs flex items-center gap-1"><Eye size={12} /> Reach</p>
            <p className="text-2xl font-bold">{(campaign.reach / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-violet-200 text-xs flex items-center gap-1"><TrendingUp size={12} /> Engagement</p>
            <p className="text-2xl font-bold">{campaign.engagement.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-violet-200 text-xs flex items-center gap-1"><Users size={12} /> Applicants</p>
            <p className="text-2xl font-bold">{campaign.applicants}</p>
          </div>
          <div>
            <p className="text-violet-200 text-xs flex items-center gap-1"><DollarSign size={12} /> Spent</p>
            <p className="text-2xl font-bold">₹{campaign.spent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Budget', value: `₹${campaign.budget.toLocaleString()}`, color: 'text-blue-700' },
          { label: 'Accepted Creators', value: String(campaign.accepted), color: 'text-emerald-700' },
          { label: 'Reach Factor', value: `${campaign.reachFactor}x`, color: 'text-amber-700' },
          { label: 'Conversion Rate', value: campaign.applicants > 0 ? `${((campaign.accepted / campaign.applicants) * 100).toFixed(0)}%` : '—', color: 'text-violet-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Performance Breakdown</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Value']} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {campaign.description && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-2">Campaign Overview</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
        </div>
      )}
    </div>
  );
}
