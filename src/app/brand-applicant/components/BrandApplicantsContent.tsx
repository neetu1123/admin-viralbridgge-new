'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, Users, TrendingUp, Star, MessageSquare, UserCheck, Eye, User } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import {
  extractList,
  mapBrandApplicant,
  type BrandApplicantRow,
} from '@/src/lib/mappers';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import RejectApplicationModal from '@/src/components/brand/RejectApplicationModal';

const applicantStatusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-200' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border border-violet-200' },
};

export default function BrandApplicantsContent() {
  const [applicants, setApplicants] = useState<BrandApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectTarget, setRejectTarget] = useState<BrandApplicantRow | null>(null);

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const campaignsRes = await brandApi.getCampaigns({ limit: 50 });
      const rawCampaigns = extractList<Record<string, unknown>>(campaignsRes);

      const embedded = rawCampaigns.flatMap((campaign) =>
        ((campaign.applications as Record<string, unknown>[]) ?? []).map((application) =>
          mapBrandApplicant(application, campaign),
        ),
      );

      if (embedded.length > 0) {
        setApplicants(embedded);
        return;
      }

      const fetched = await Promise.all(
        rawCampaigns.map(async (campaign) => {
          try {
            const appsRes = await brandApi.getApplicants(String(campaign.id));
            return extractList<Record<string, unknown>>(appsRes).map((application) =>
              mapBrandApplicant(application, campaign),
            );
          } catch {
            return [];
          }
        }),
      );
      setApplicants(fetched.flat());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const handleApplicantAction = async (
    appId: string,
    action: 'shortlist' | 'approve' | 'reject',
    name?: string,
    reason?: string,
  ) => {
    try {
      if (action === 'shortlist') await brandApi.shortlistApplication(appId);
      else if (action === 'approve') await brandApi.approveApplication(appId);
      else await brandApi.rejectApplication(appId, reason ?? 'Not selected for this campaign');
      toast.success(
        action === 'approve'
          ? `${name ?? 'Creator'} approved`
          : action === 'shortlist'
            ? `${name ?? 'Creator'} shortlisted`
            : `${name ?? 'Creator'} rejected`,
      );
      await loadApplicants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const filtered = applicants.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.campaign.toLowerCase().includes(search.toLowerCase()) ||
      a.handle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Applicants</h1>
        <p className="text-slate-500 text-sm mt-1">Review and manage creator applications across your campaigns</p>
      </div>

      {/* Applicants list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">{filtered.length} applicants</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or campaign..."
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
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((applicant) => (
            <div key={applicant.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-700 text-xs font-bold">{applicant.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-slate-800">{applicant.name}</p>
                      <p className="text-xs text-violet-600">{applicant.handle}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${applicantStatusConfig[applicant.status]?.cls}`}>
                        {applicantStatusConfig[applicant.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5 line-clamp-1">{applicant.bio || 'No application message'}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users size={10} className="text-slate-400" />
                        {(applicant.followers / 1000).toFixed(1)}K followers
                      </span>
                      <span className="text-xs text-emerald-700 flex items-center gap-1">
                        <TrendingUp size={10} />
                        {applicant.engagementRate}% eng.
                      </span>
                      <PlatformBadge platform={applicant.platform} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Applied to: <span className="text-slate-600 font-medium">{applicant.campaign}</span> · {applicant.appliedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {applicant.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApplicantAction(applicant.id, 'shortlist', applicant.name)}
                        className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleApplicantAction(applicant.id, 'approve', applicant.name)}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(applicant)}
                        className="text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {applicant.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => setRejectTarget(applicant)}
                        className="text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApplicantAction(applicant.id, 'approve', applicant.name)}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <UserCheck size={12} />
                        Approve
                      </button>
                    </>
                  )}
                  <Link
                    href={`/brand-applicant/${applicant.id}`}
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye size={12} />
                    View Application
                  </Link>
                  {applicant.creatorId && (
                    <Link
                      href={`/brand-creator-profile/${applicant.creatorId}?applicationId=${applicant.id}`}
                      className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <User size={12} />
                      View Profile
                    </Link>
                  )}
                  {applicant.status === 'approved' && (
                    <Link
                      href="/brand-messages"
                      className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={12} />
                      Message
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={36} className="text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-semibold mb-1">No applicants yet</h3>
              <p className="text-slate-400 text-sm text-center max-w-sm">
                No creators have applied yet. Share campaigns or invite creators from Creator Discovery.
              </p>
              <Link
                href="/creator-discovery"
                className="mt-4 text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                Browse creators →
              </Link>
            </div>
          )}
        </div>
      </div>

      <RejectApplicationModal
        open={!!rejectTarget}
        creatorName={rejectTarget?.name}
        onClose={() => setRejectTarget(null)}
        onConfirm={async (reason) => {
          if (!rejectTarget) return;
          await handleApplicantAction(rejectTarget.id, 'reject', rejectTarget.name, reason);
        }}
      />
    </div>
  );
}
