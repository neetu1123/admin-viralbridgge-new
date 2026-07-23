'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Calendar, CheckCircle, Globe, Users } from 'lucide-react';
import { creatorApi } from '@/src/lib/api';
import { extractList, mapDiscoveryCampaign } from '@/src/lib/mappers';
import ApplyCampaignForm from '../../../components/ApplyCampaignForm';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

interface ApplyCampaignPageContentProps {
  campaignId: string;
}

export default function ApplyCampaignPageContent({ campaignId }: ApplyCampaignPageContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [campaign, setCampaign] = useState<ReturnType<typeof mapDiscoveryCampaign> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, appsRes] = await Promise.all([
        creatorApi.getCampaign(campaignId),
        creatorApi.getApplications({ limit: 100 }),
      ]);

      const mapped = mapDiscoveryCampaign(campaignRes as Record<string, unknown>);
      setCampaign(mapped);

      const appliedIds = new Set(
        extractList<Record<string, unknown>>(appsRes).map((a) => String(a.campaign_id)),
      );
      setAlreadyApplied(appliedIds.has(campaignId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaign not found');
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8 flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8 text-center py-24">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Campaign not found</h1>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <Link href="/campaign-discovery" className="text-violet-600 font-semibold text-sm hover:underline">
          Back to Campaign Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" richColors />

      <Link
        href="/campaign-discovery"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Campaign Discovery
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-5 sm:p-6 text-white">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-1">{campaign.brand}</p>
          <h1 className="text-xl sm:text-2xl font-bold">{campaign.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-violet-100">
            <PlatformBadge platform={campaign.platform} />
            <span className="flex items-center gap-1"><Globe size={14} /> {campaign.locality}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Deadline {campaign.deadline}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {campaign.applicants} applicants</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 mb-1">About this campaign</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
          </div>

          {campaign.deliverables.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Deliverables</h2>
              <ul className="space-y-1.5">
                {campaign.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-violet-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Budget</p>
              <p className="text-lg font-bold text-slate-800">₹{campaign.budget.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Platform</p>
              <p className="text-lg font-bold text-slate-800">{campaign.platform}</p>
            </div>
          </div>
        </div>
      </div>

      {alreadyApplied ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <CheckCircle size={32} className="mx-auto text-emerald-600 mb-2" />
          <h2 className="font-semibold text-emerald-800">You already applied to this campaign</h2>
          <p className="text-sm text-emerald-700 mt-1 mb-4">Track your application status in My Applications.</p>
          <Link
            href="/my-applications"
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            View My Applications
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Submit Your Application</h2>
          <ApplyCampaignForm
            campaign={campaign}
            onCancel={() => router.push('/campaign-discovery')}
            onSuccess={() => {
              toast.success('Application submitted successfully!');
              router.push('/my-applications');
            }}
            onError={(message) => toast.error(message)}
          />
        </div>
      )}
    </div>
  );
}
