'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { X, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList } from '@/src/lib/mappers';

const STORAGE_KEY = 'brand_campaign_nudge_dismissed';
const DELAY_MS = 12000;

export default function BrandCampaignNudge() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const evaluate = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setChecked(true);
      return;
    }

    try {
      const res = await brandApi.getCampaigns({ limit: 1 });
      const campaigns = extractList(res);
      if (campaigns.length === 0) {
        setOpen(true);
      }
    } catch {
      /* don't block UX on API errors */
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    if (checked) return;
    const timer = window.setTimeout(() => {
      evaluate();
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [checked, evaluate]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-violet-100 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/15 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-violet-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-200">Limited time</span>
          </div>
          <h2 className="text-xl font-bold leading-snug pr-8">
            Creators are waiting — launch your first campaign now
          </h2>
          <p className="text-violet-100 text-sm mt-2 leading-relaxed">
            Brands with live campaigns get matched to creators in under 24 hours. Don&apos;t miss the momentum.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Rocket size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
              Post a campaign and receive creator applications instantly
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
              AI matching surfaces the best-fit creators for your niche
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link
              href="/brand-campaign-management?create=1"
              onClick={dismiss}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
            >
              Create Campaign Now
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
