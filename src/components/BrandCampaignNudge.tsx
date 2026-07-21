'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import { campaignPromptApi } from '@/src/lib/api';

const STORAGE_KEY = 'brand_campaign_nudge_dismissed_at';
const TEST_MODE = process.env.NEXT_PUBLIC_CAMPAIGN_PROMPT_TEST === 'true';
const DELAY_MS = TEST_MODE ? 5000 : 30000;
const SCROLL_THRESHOLD = 400;

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  const cooldown = TEST_MODE ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < cooldown;
}

export default function BrandCampaignNudge() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const scrollTriggered = useRef(false);

  const evaluate = useCallback(async () => {
    if (typeof window === 'undefined' || isDismissed()) {
      setChecked(true);
      return;
    }

    try {
      const status = await campaignPromptApi.getStatus();
      if (status.shouldShow) {
        setOpen(true);
        await campaignPromptApi.recordEvent('DISPLAYED').catch(() => undefined);
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

    const onScroll = () => {
      if (scrollTriggered.current || checked) return;
      if (window.scrollY >= SCROLL_THRESHOLD) {
        scrollTriggered.current = true;
        evaluate();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [checked, evaluate]);

  const dismiss = async () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    await campaignPromptApi.recordEvent('CLOSED').catch(() => undefined);
    setOpen(false);
  };

  const onCreateClick = async () => {
    await campaignPromptApi.recordEvent('CREATE_CLICKED').catch(() => undefined);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
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
            <span className="text-xs font-bold uppercase tracking-wider text-violet-200">Get started</span>
          </div>
          <h2 className="text-xl font-bold leading-snug pr-8">
            Ready to Start Your First Campaign?
          </h2>
          <p className="text-violet-100 text-sm mt-2 leading-relaxed">
            Connect with verified creators and launch your first influencer campaign today.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Rocket size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
              Find verified creators in your industry
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={15} className="text-violet-600 mt-0.5 flex-shrink-0" />
              AI matching surfaces the best-fit creators for your niche
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link
              href="/brand-campaign-management/create"
              onClick={onCreateClick}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
            >
              Create Campaign
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
