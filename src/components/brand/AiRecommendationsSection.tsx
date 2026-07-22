'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AI_RECOMMENDATION_FILTERS,
  MOCK_AI_RECOMMENDATIONS,
  type AiRecommendationFilter,
} from '@/src/lib/mock/aiRecommendations';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

export default function AiRecommendationsSection() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AiRecommendationFilter>('all');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_AI_RECOMMENDATIONS.filter((item) => {
      if (filter === 'trending') return item.trending;
      if (filter === 'recent') return item.recentlyActive;
      if (filter === 'premium') return item.premium;
      if (filter === 'verified') return item.verified;
      return true;
    });
  }, [filter]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef) return;
    scrollRef.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast.success(saved.has(id) ? 'Removed from saved' : 'Creator saved');
  };

  return (
    <div className="bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={18} className="text-violet-600" />
              AI Recommendations
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Recommended for you based on your previous campaigns, industry, interests, and platform activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_RECOMMENDATION_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  filter === item.id
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 relative">
        <div className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10">
          <button type="button" onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50">
            <ChevronLeft size={16} />
          </button>
        </div>
        <div className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <button type="button" onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50">
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 rounded-2xl border border-slate-200 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No recommendations match this filter.</p>
        ) : (
          <div ref={setScrollRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scroll-smooth">
            {filtered.map((creator) => (
              <div
                key={creator.id}
                className="snap-start flex-shrink-0 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border-2 border-violet-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{creator.name}</p>
                    <p className="text-xs text-slate-500">{creator.category}</p>
                    <div className="mt-1">
                      <PlatformBadge platform={creator.platform} />
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7B2FF7, #F357A8)' }}
                  >
                    {creator.matchScore}% Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {creator.followers}</span>
                  <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-500" /> {creator.engagementRate}</span>
                  <span className="inline-flex items-center gap-1 col-span-2"><MapPin size={12} /> {creator.location}</span>
                </div>

                <p className="text-xs text-violet-700 bg-violet-50 rounded-lg px-3 py-2 mb-4 border border-violet-100">
                  {creator.reason}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {creator.languages.map((lang) => (
                    <span key={lang} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lang}</span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/creator-discovery"
                    className="col-span-1 text-center text-[11px] font-semibold py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => toast.success(`Invite sent to ${creator.name}`)}
                    className="col-span-1 text-[11px] font-semibold py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <UserPlus size={12} /> Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSave(creator.id)}
                    className={`col-span-1 text-[11px] font-semibold py-2 rounded-lg border transition-colors inline-flex items-center justify-center gap-1 ${
                      saved.has(creator.id) ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {saved.has(creator.id) ? <Heart size={12} className="fill-violet-600 text-violet-600" /> : <Bookmark size={12} />}
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
