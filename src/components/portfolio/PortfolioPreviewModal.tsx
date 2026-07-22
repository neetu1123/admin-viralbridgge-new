'use client';

import React from 'react';
import { Calendar, Eye, Heart, MessageCircle, X } from 'lucide-react';
import Modal from '@/src/components/ui/Modal';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import type { CreatorPortfolioItem } from '@/src/lib/mock/portfolioData';

interface PortfolioPreviewModalProps {
  item: CreatorPortfolioItem | null;
  onClose: () => void;
}

export default function PortfolioPreviewModal({ item, onClose }: PortfolioPreviewModalProps) {
  if (!item) return null;

  return (
    <Modal open onClose={onClose} title="Portfolio Preview" size="lg">
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail}
            alt={item.campaignName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={item.platform} />
          <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full capitalize">
            {item.type.replace('-', ' ')}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800">{item.campaignName}</h3>
          <p className="text-sm text-slate-500">{item.brandName}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Eye size={13} /> Views</div>
            <p className="font-bold text-slate-800">{item.views}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Heart size={13} /> Likes</div>
            <p className="font-bold text-slate-800">{item.likes}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><MessageCircle size={13} /> Comments</div>
            <p className="font-bold text-slate-800">{item.comments}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1"><Calendar size={13} /> Published</div>
            <p className="font-bold text-slate-800 text-sm">{item.publishDate}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} /> Close Preview
        </button>
      </div>
    </Modal>
  );
}
