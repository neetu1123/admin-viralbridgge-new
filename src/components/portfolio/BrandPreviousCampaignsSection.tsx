'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, DollarSign, Plus, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import Modal from '@/src/components/ui/Modal';
import {
  MOCK_BRAND_CAMPAIGNS,
  PORTFOLIO_PLATFORMS,
  type BrandPreviousCampaign,
  type PortfolioPlatform,
} from '@/src/lib/mock/portfolioData';

function statusStyle(status: BrandPreviousCampaign['status']) {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Active') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export default function BrandPreviousCampaignsSection() {
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<PortfolioPlatform | 'All'>('All');
  const [previewCampaign, setPreviewCampaign] = useState<BrandPreviousCampaign | null>(null);
  const [campaigns] = useState(MOCK_BRAND_CAMPAIGNS);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (platformFilter === 'All') return campaigns;
    return campaigns.filter((c) => c.platforms.includes(platformFilter));
  }, [campaigns, platformFilter]);

  const featured = filtered.filter((c) => c.featured);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Previous Campaigns</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showcase past campaigns on your public brand profile</p>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Campaign upload coming soon — mock data only')}
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors self-start"
          >
            <Plus size={12} /> Add Campaign
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={() => setPlatformFilter('All')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              platformFilter === 'All' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            All Platforms
          </button>
          {PORTFOLIO_PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setPlatformFilter(platform)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                platformFilter === platform ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-32 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No portfolio available yet.</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Add completed campaigns to build brand credibility.</p>
            <button
              type="button"
              onClick={() => toast.info('Upload coming soon')}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <Upload size={14} /> Upload Campaign
            </button>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Featured Campaigns</p>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {featured.map((campaign) => (
                    <button
                      key={`feat-${campaign.id}`}
                      type="button"
                      onClick={() => setPreviewCampaign(campaign)}
                      className="snap-start flex-shrink-0 w-80 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={campaign.banner} alt={campaign.name} className="w-full h-28 object-cover" loading="lazy" />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-slate-800">{campaign.name}</p>
                        <p className="text-xs text-slate-500">{campaign.industry}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {filtered.map((campaign) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => setPreviewCampaign(campaign)}
                  className="break-inside-avoid w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={campaign.banner} alt={campaign.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{campaign.name}</p>
                        <p className="text-xs text-slate-500">{campaign.industry}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      <span className="inline-flex items-center gap-1"><DollarSign size={12} /> {campaign.budget}</span>
                      <span className="inline-flex items-center gap-1"><Users size={12} /> {campaign.creatorCount} creators</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {campaign.platforms.map((p) => (
                        <PlatformBadge key={`${campaign.id}-${p}`} platform={p} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {campaign.thumbnails.slice(0, 4).map((thumb, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-100" loading="lazy" />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={Boolean(previewCampaign)} onClose={() => setPreviewCampaign(null)} title="Campaign Preview" size="lg">
        {previewCampaign && (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewCampaign.banner} alt={previewCampaign.name} className="w-full h-48 object-cover rounded-xl" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">{previewCampaign.name}</h3>
              <p className="text-sm text-slate-500">{previewCampaign.industry}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 text-xs block">Budget</span>{previewCampaign.budget}</div>
              <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 text-xs block">Creators</span>{previewCampaign.creatorCount}</div>
              <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-400 text-xs block">Status</span>{previewCampaign.status}</div>
              <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-1"><Calendar size={14} className="text-slate-400" /> Showcase</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {previewCampaign.platforms.map((p) => (
                <PlatformBadge key={p} platform={p} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previewCampaign.thumbnails.map((thumb, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={thumb} alt="" className="w-full aspect-square object-cover rounded-xl" />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
