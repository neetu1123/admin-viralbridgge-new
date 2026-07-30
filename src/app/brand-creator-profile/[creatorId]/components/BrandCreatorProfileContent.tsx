'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2, Mail, MapPin, TrendingUp, Users, ExternalLink } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList, mapCreatorCard } from '@/src/lib/mappers';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

export default function BrandCreatorProfileContent({ creatorId }: { creatorId: string }) {
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<ReturnType<typeof mapCreatorCard> | null>(null);

  const loadCreator = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.getCreators({ limit: 100 });
      const rows = extractList<Record<string, unknown>>(res);
      const match = rows.find((r) => String(r.id ?? r.user_id) === creatorId);
      if (match) {
        setCreator(mapCreatorCard(match));
        return;
      }
      const appsRes = await brandApi.getCampaigns({ limit: 50 });
      const campaigns = extractList<Record<string, unknown>>(appsRes);
      for (const campaign of campaigns) {
        const apps = (campaign.applications as Record<string, unknown>[]) ?? [];
        for (const app of apps) {
          const c = (app.creator as Record<string, unknown>) ?? {};
          if (String(c.id ?? app.creator_id) === creatorId) {
            setCreator(mapCreatorCard(c));
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
  }, [creatorId]);

  useEffect(() => {
    void loadCreator();
  }, [loadCreator]);

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
        <Link href="/brand-applicant" className="text-violet-600 font-semibold text-sm">Back to Applicants</Link>
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />
      <Link href="/brand-applicant" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={14} /> Back to Applicants
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {creator.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{creator.name}</h1>
              <p className="text-violet-200 text-sm">{creator.handle}</p>
              {creator.verified && (
                <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {creator.bio && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Bio</h2>
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
              <Mail size={14} className="text-amber-600 mb-1" />
              <p className="text-sm font-bold text-slate-800 truncate">{creator.niche}</p>
              <p className="text-xs text-slate-500">Niche</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <PlatformBadge platform={creator.platform} />
            <span className="text-xs text-slate-500">{creator.language}</span>
            <span className="text-xs text-slate-500">From ₹{creator.pricePerPost.toLocaleString()}/post</span>
          </div>

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
              <ExternalLink size={14} /> Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
