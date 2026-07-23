'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, CheckCircle, XCircle, MessageSquare, TrendingUp, Users, Star, ExternalLink } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Link from 'next/link';
import { brandApi } from '@/src/lib/api';

interface Applicant {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  followers: number;
  engagementRate: number;
  platform: string;
  message: string;
  proposedPrice: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'shortlisted';
  appliedAt: string;
  rating: number;
  pastCollabs: number;
}

interface Campaign {
  id: string;
  title: string;
  budget: number;
  platform: string;
}

interface ApplicantDrawerProps {
  campaign: Campaign;
  onClose: () => void;
}

function badgeStatus(status: Applicant['status']): 'pending' | 'accepted' | 'rejected' {
  if (status === 'shortlisted') return 'pending';
  return status;
}

function mapStatus(status: string): Applicant['status'] {
  const normalized = status.toUpperCase();
  if (normalized === 'ACCEPTED') return 'accepted';
  if (normalized === 'REJECTED') return 'rejected';
  if (normalized === 'SHORTLISTED') return 'shortlisted';
  return 'pending';
}

function mapApplicant(raw: any): Applicant {
  const creator = raw.creator ?? {};
  const user = creator.user ?? {};
  const social = (creator.social_links as Record<string, string>) ?? {};
  const handle = social.instagram || social.youtube || social.tiktok || user.email || '@creator';

  return {
    id: raw.id,
    name: creator.full_name || user.name || 'Creator',
    handle: handle.startsWith('@') ? handle : `@${handle.replace('@', '')}`,
    avatar: (creator.full_name || user.name || 'CR').slice(0, 2).toUpperCase(),
    niche: creator.niche || 'General',
    followers: creator.followers ?? 0,
    engagementRate: creator.engagement_rate ?? 0,
    platform: raw.campaign?.platform || 'Instagram',
    message: raw.message || '',
    proposedPrice: raw.proposed_price ?? null,
    status: mapStatus(raw.status),
    appliedAt: raw.created_at?.slice(0, 10) ?? '',
    rating: 4.5,
    pastCollabs: 0,
  };
}

const TABS = [
  { id: 'all' as const, label: 'All' },
  { id: 'pending' as const, label: 'Pending' },
  { id: 'accepted' as const, label: 'Accepted' },
  { id: 'rejected' as const, label: 'Rejected' },
];

export default function ApplicantDrawer({ campaign, onClose }: ApplicantDrawerProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [appStatuses, setAppStatuses] = useState<Record<string, Applicant['status']>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('all');

  useEffect(() => {
    brandApi
      .getApplicants(campaign.id)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        const mapped = list.map(mapApplicant);
        setApplicants(mapped);
        setAppStatuses(Object.fromEntries(mapped.map((a: Applicant) => [a.id, a.status])));
      })
      .catch((error: Error) => toast.error(error.message || 'Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [campaign.id]);

  const handleDecision = async (appId: string, decision: 'accepted' | 'rejected') => {
    try {
      if (decision === 'accepted') {
        await brandApi.approveApplication(appId);
      } else {
        await brandApi.rejectApplication(appId, 'Not selected for this campaign');
      }
      setAppStatuses((prev) => ({ ...prev, [appId]: decision }));
      const name = applicants.find((a) => a.id === appId)?.name;
      if (decision === 'accepted') {
        toast.success(`${name} accepted — escrow funds will be allocated`);
      } else {
        toast.info(`${name}'s application rejected`);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const filtered = applicants.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') {
      const status = appStatuses[a.id];
      return status === 'pending' || status === 'shortlisted';
    }
    return appStatuses[a.id] === activeTab;
  });

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => {
      const status = appStatuses[a.id];
      return status === 'pending' || status === 'shortlisted';
    }).length,
    accepted: applicants.filter((a) => appStatuses[a.id] === 'accepted').length,
    rejected: applicants.filter((a) => appStatuses[a.id] === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-card-lg animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Applicants</h2>
            <p className="text-sm text-slate-500 truncate max-w-xs">{campaign.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">Loading applicants...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={32} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">No applicants in this tab</p>
              <p className="text-xs text-slate-400 mt-1">Creators who apply will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((applicant) => {
                const currentStatus = appStatuses[applicant.id];
                const isPending = currentStatus === 'pending' || currentStatus === 'shortlisted';

                return (
                  <div
                    key={applicant.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-700 text-xs font-bold">{applicant.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{applicant.name}</p>
                            <StatusBadge status={badgeStatus(currentStatus)} />
                          </div>
                          <span className="text-xs text-slate-400">
                            {applicant.appliedAt
                              ? new Date(applicant.appliedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : ''}
                          </span>
                        </div>
                        <p className="text-xs text-violet-600 font-medium mb-2">{applicant.handle}</p>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <Users size={11} className="text-slate-400" />
                            {(applicant.followers / 1000).toFixed(1)}K
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              applicant.engagementRate >= 4 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            <TrendingUp size={11} />
                            {applicant.engagementRate}%
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            {applicant.rating}
                          </span>
                          {applicant.proposedPrice != null && (
                            <span
                              className={`text-xs font-semibold tabular-nums ${
                                applicant.proposedPrice > campaign.budget ? 'text-red-600' : 'text-emerald-700'
                              }`}
                            >
                              ${applicant.proposedPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {applicant.message && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg p-2.5 mb-3 line-clamp-2">
                            &ldquo;{applicant.message}&rdquo;
                          </p>
                        )}
                        {isPending && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleDecision(applicant.id, 'accepted')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(applicant.id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                            <Link
                              href="/brand-messaging"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              <MessageSquare size={13} /> Message
                            </Link>
                          </div>
                        )}
                        {!isPending && (
                          <Link
                            href="/creator-discovery"
                            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
                          >
                            View profile <ExternalLink size={11} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
