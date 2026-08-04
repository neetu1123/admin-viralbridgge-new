'use client';

import React, { useMemo } from 'react';
import { ExternalLink, ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

export type PortfolioItemRow = {
  id: string;
  title: string;
  platform: string;
  views: string;
  engagement: string;
  url: string;
};

interface CreatorPortfolioSectionProps {
  items?: PortfolioItemRow[];
}

export default function CreatorPortfolioSection({ items = [] }: CreatorPortfolioSectionProps) {
  const portfolioItems = useMemo(() => items.filter((i) => i.title || i.url), [items]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Portfolio</h2>
          <p className="text-xs text-slate-500 mt-0.5">Showcase your best campaign work to brands</p>
        </div>
      </div>

      {portfolioItems.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={24} className="text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">No portfolio items yet</h3>
          <p className="text-xs text-slate-500 mt-1">Save your profile with portfolio links to display them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all overflow-hidden flex flex-col"
            >
              <div className="h-28 bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center">
                <PlatformBadge platform={item.platform} />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">{item.platform}</p>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3">
                  {item.views !== '—' && <span>Views: {item.views}</span>}
                  {item.engagement !== '—' && <span>Engagement: {item.engagement}</span>}
                </div>
                {item.url ? (
                  <a
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    View work <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="mt-auto text-xs text-slate-400">No link added</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
