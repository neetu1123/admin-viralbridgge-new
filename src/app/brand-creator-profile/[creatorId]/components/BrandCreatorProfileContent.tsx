'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  TrendingUp,
  Users,
  ExternalLink,
  Globe,
  Phone,
  Star,
  Briefcase,
  FileText,
} from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList, mapBrandCreatorProfileDetail, type BrandCreatorProfileDetail } from '@/src/lib/mappers';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

function findCreatorInRaw(raw: Record<string, unknown>, creatorId: string): Record<string, unknown> | null {
  const id = String(raw.id ?? raw.user_id ?? '');
  if (id === creatorId) return raw;
  const creator = raw.creator as Record<string, unknown> | undefined;
  if (creator && String(creator.id ?? raw.creator_id) === creatorId) return creator;
  return null;
}

export default function BrandCreatorProfileContent({ creatorId }: { creatorId: string }) {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<BrandCreatorProfileDetail | null>(null);
  const [applicationCampaign, setApplicationCampaign] = useState<string | null>(null);

  const loadCreator = useCallback(async () => {
    setLoading(true);
    try {
      if (applicationId) {
        try {
          const appRaw = (await brandApi.getApplication(applicationId)) as Record<string, unknown>;
          const campaign = (appRaw.campaign as Record<string, unknown>) ?? {};
          setApplicationCampaign(String(campaign.title ?? ''));
          const c = (appRaw.creator as Record<string, unknown>) ?? {};
          if (String(c.id ?? appRaw.creator_id) === creatorId || Object.keys(c).length > 0) {
            setCreator(mapBrandCreatorProfileDetail(c));
            return;
          }
        } catch {
          /* fall through to other sources */
        }
      }

      const res = await brandApi.getCreators({ limit: 100 });
      const rows = extractList<Record<string, unknown>>(res);
      const match = rows.find((r) => findCreatorInRaw(r, creatorId));
      if (match) {
        setCreator(mapBrandCreatorProfileDetail(findCreatorInRaw(match, creatorId) ?? match));
        return;
      }

      const campaignsRes = await brandApi.getCampaigns({ limit: 50 });
      const campaigns = extractList<Record<string, unknown>>(campaignsRes);
      for (const campaign of campaigns) {
        const apps = (campaign.applications as Record<string, unknown>[]) ?? [];
        for (const app of apps) {
          const c = (app.creator as Record<string, unknown>) ?? {};
          if (String(c.id ?? app.creator_id) === creatorId) {
            setCreator(mapBrandCreatorProfileDetail(c));
            return;
          }
        }
      }

      setCreator(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load creator profile');
      setCreator(null);
    } finally {
      setLoading(false);
    }
  }, [creatorId, applicationId]);

  useEffect(() => {
    void loadCreator();
  }, [loadCreator]);

  const backHref = applicationId ? `/brand-applicant/${applicationId}` : '/brand-applicant';
  const backLabel = applicationId ? 'Back to Application' : 'Back to Applicants';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Creator profile not found</p>
        <Link href={backHref} className="text-violet-600 font-semibold text-sm">{backLabel}</Link>
      </div>
    );
  }

  const socialLinks = [
    { label: 'Instagram', url: creator.instagram },
    { label: 'YouTube', url: creator.youtube },
    { label: 'TikTok', url: creator.tiktok },
    { label: 'Twitter / X', url: creator.twitter },
    { label: 'Website', url: creator.website },
  ].filter((l) => l.url);

  return (
    <div className="pb-8 max-w-4xl">
      <Toaster position="bottom-right" richColors />
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={14} /> {backLabel}
      </Link>

      {applicationCampaign && (
        <div className="mb-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 text-sm text-violet-800">
          Applicant for campaign: <span className="font-semibold">{applicationCampaign}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
          <div className="flex items-center gap-4">
            {creator.photoUrl ? (
              <img
                src={creator.photoUrl}
                alt={creator.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {creator.avatar}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <p className="text-violet-200 text-sm">{creator.handle}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {creator.verified && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Verified</span>
                )}
                <PlatformBadge platform={creator.platform} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {creator.bio && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">About</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{creator.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <Users size={14} className="text-violet-600 mb-1" />
              <p className="text-lg font-bold text-slate-800">{(creator.followers / 1000).toFixed(1)}K</p>
              <p className="text-xs text-slate-500">Followers</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <TrendingUp size={14} className="text-emerald-600 mb-1" />
              <p className="text-lg font-bold text-slate-800">{creator.engagementRate}%</p>
              <p className="text-xs text-slate-500">Engagement</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <MapPin size={14} className="text-blue-600 mb-1" />
              <p className="text-sm font-bold text-slate-800 truncate">{creator.location}</p>
              <p className="text-xs text-slate-500">Location</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <Star size={14} className="text-amber-600 mb-1" />
              <p className="text-lg font-bold text-slate-800">{creator.rating}</p>
              <p className="text-xs text-slate-500">Rating</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact</h2>
              <div className="space-y-2 text-sm">
                {creator.email && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-slate-400" /> {creator.email}
                  </p>
                )}
                {creator.phone && (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Phone size={14} className="text-slate-400" /> {creator.phone}
                  </p>
                )}
                {!creator.email && !creator.phone && (
                  <p className="text-slate-400 text-xs">Contact details not shared</p>
                )}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Work details</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" />
                  From ₹{creator.pricePerPost.toLocaleString()} / post
                </p>
                <p className="flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" />
                  {creator.language}
                </p>
              </div>
            </div>
          </div>

          {creator.niches.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Niches</h2>
              <div className="flex flex-wrap gap-2">
                {creator.niches.map((niche) => (
                  <span key={niche} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Social & links</h2>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> {link.label}
                  </a>
                ))}
                {creator.mediaKit && (
                  <a
                    href={creator.mediaKit.startsWith('http') ? creator.mediaKit : `https://${creator.mediaKit}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  >
                    <FileText size={12} /> Media Kit
                  </a>
                )}
              </div>
            </div>
          )}

          {creator.portfolio.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Portfolio</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {creator.portfolio.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-3 hover:border-violet-200 transition-colors">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mb-2">{item.platform}</p>
                    {item.url && (
                      <a
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 inline-flex items-center gap-1"
                      >
                        View work <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <Link
              href={`/creator-discovery?invite=${creatorId}`}
              className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Invite to Campaign
            </Link>
            <Link
              href="/brand-messages"
              className="text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <Mail size={14} /> Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
