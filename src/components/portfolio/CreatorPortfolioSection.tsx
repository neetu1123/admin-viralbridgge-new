'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Eye, Heart, MessageCircle, Plus, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import PortfolioPreviewModal from './PortfolioPreviewModal';
import {
  MOCK_CREATOR_PORTFOLIO,
  PORTFOLIO_PLATFORMS,
  type CreatorPortfolioItem,
  type PortfolioPlatform,
} from '@/src/lib/mock/portfolioData';

function PortfolioSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="break-inside-avoid rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
          <div className={`bg-slate-200 ${i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-56'}`} />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CreatorPortfolioSection() {
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<PortfolioPlatform | 'All'>('All');
  const [previewItem, setPreviewItem] = useState<CreatorPortfolioItem | null>(null);
  const [items] = useState(MOCK_CREATOR_PORTFOLIO);
  const showEmpty = items.length === 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (platformFilter === 'All') return items;
    return items.filter((item) => item.platform === platformFilter);
  }, [items, platformFilter]);

  const featured = filtered.filter((item) => item.featured);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Portfolio</h2>
          <p className="text-xs text-slate-500 mt-0.5">Showcase your best campaign work to brands</p>
        </div>
        <button
          type="button"
          onClick={() => toast.info('Upload coming soon — mock portfolio only for now')}
          className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors self-start"
        >
          <Plus size={12} /> Upload Work
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          onClick={() => setPlatformFilter('All')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            platformFilter === 'All' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
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
              platformFilter === platform ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {loading ? (
        <PortfolioSkeleton />
      ) : showEmpty ? (
        <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} className="text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">No portfolio available yet.</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Upload your best reels, posts, and campaign content.</p>
          <button
            type="button"
            onClick={() => toast.info('Upload coming soon')}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={14} /> Upload Portfolio Item
          </button>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Featured</p>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                {featured.map((item) => (
                  <button
                    key={`featured-${item.id}`}
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="snap-start flex-shrink-0 w-72 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbnail} alt={item.campaignName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <div className="absolute top-2 left-2">
                        <PlatformBadge platform={item.platform} />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.campaignName}</p>
                      <p className="text-xs text-slate-500">{item.brandName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreviewItem(item)}
                className="break-inside-avoid w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.campaignName}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2">
                    <PlatformBadge platform={item.platform} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.campaignName}</p>
                  <p className="text-xs text-slate-500 mb-3">{item.brandName}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> {item.views}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={11} /> {item.likes}</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={11} /> {item.comments}</span>
                    <span className="inline-flex items-center gap-1"><Calendar size={11} /> {item.publishDate}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <PortfolioPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
