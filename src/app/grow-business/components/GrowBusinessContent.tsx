'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Package, Wallet, Loader2, BadgeCheck, TrendingUp } from 'lucide-react';
import { listingApi } from '@/src/lib/api';
import { toast } from 'sonner';

type Suggestions = Awaited<ReturnType<typeof listingApi.getSuggestions>>;
const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://viralbridgge-new.vercel.app';

function formatFollowers(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value || 0);
}

function publicHref(path: string) {
  return `${PUBLIC_SITE}${path}`;
}

export default function GrowBusinessContent() {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();

  const loadSuggestions = async (min = budgetMin, max = budgetMax) => {
    setLoading(true);
    try {
      const data = await listingApi.getSuggestions(min, max);
      setSuggestions(data);
      if (!data.listingReady) {
        toast.message('Add city, category, and services on My Listing for closer matches.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const applyBudget = (min: number, max: number | null) => {
    const nextMin = min || undefined;
    const nextMax = max ?? undefined;
    setBudgetMin(nextMin);
    setBudgetMax(nextMax);
    void loadSuggestions(nextMin, nextMax);
  };

  return (
    <div className="pb-8">
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-100">AI suggestions</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2">Grow my business</h1>
        <p className="text-sm text-violet-100 mt-2 max-w-2xl">
          Get nearby creators, related products or services, and an approximate budget filter from your listing.
        </p>
        <button
          type="button"
          onClick={() => void loadSuggestions()}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-violet-50 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Grow my business
        </button>
      </div>

      {!suggestions && !loading ? (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
          Click Grow my business after you list your account. Complete city and category for better nearby matches.
          <div className="mt-3">
            <Link href="/my-listing" className="text-violet-700 font-semibold">List / manage my business</Link>
          </div>
        </div>
      ) : null}

      {suggestions ? (
        <div className="mt-6 space-y-5">
          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-violet-600" />
              <h2 className="font-semibold text-slate-800">Approximate budget filter</h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.budget.bands.map((band) => {
                const active = budgetMin === band.min && budgetMax === (band.max ?? undefined);
                return (
                  <button
                    key={band.label}
                    type="button"
                    onClick={() => applyBudget(band.min, band.max)}
                    className={`text-sm px-3 py-1.5 rounded-full border ${active ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-violet-600" />
              <h2 className="font-semibold text-slate-800">Available creators nearby</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">{suggestions.city ? `Matching ${suggestions.city}` : 'Showing top available creators'}</p>
            {suggestions.nearbyCreators.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">No creators found for this filter yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {suggestions.nearbyCreators.map((creator) => (
                  <article key={creator.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-violet-300 hover:shadow-sm transition-all">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-sm font-semibold text-violet-700 flex-shrink-0">
                          {creator.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={creator.photo} alt={creator.name} className="w-full h-full object-cover" />
                          ) : (
                            creator.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 truncate">{creator.name}</h3>
                            {creator.featured ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{creator.niche || creator.category || 'Creator'}</p>
                          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                            <MapPin size={11} /> {creator.city || 'India'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <p className="text-sm font-bold text-slate-800">{formatFollowers(creator.followers)}</p>
                          <p className="text-[10px] text-slate-400">Followers</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                          <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
                            <TrendingUp size={12} className="text-emerald-600" />
                            {(creator.engagementRate || 0).toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-slate-400">Engagement</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {creator.niche ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{creator.niche}</span> : null}
                        {(creator.languages || []).slice(0, 2).map((lang) => (
                          <span key={lang} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{lang}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto border-t border-slate-100 p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400">Starting from</p>
                        <p className="text-sm font-bold text-slate-800">{creator.estimatedBudget}</p>
                      </div>
                      <a
                        href={publicHref(creator.publicPath)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-xs font-semibold text-white px-4 py-2 rounded-xl"
                        style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
                      >
                        View Profile
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-violet-600" />
              <h2 className="font-semibold text-slate-800">Related products or services</h2>
            </div>
            {suggestions.relatedProducts.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.relatedProducts.map((item) => (
                  <span key={item} className="text-xs font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">{item}</span>
                ))}
              </div>
            ) : null}
            {suggestions.relatedListings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">Add services on your listing to see related businesses.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {suggestions.relatedListings.map((row) => (
                  <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-violet-300 hover:shadow-sm transition-all">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-sm font-semibold text-violet-700 flex-shrink-0">
                        {row.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.logo} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                          row.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">{row.name}</h3>
                            <p className="text-xs text-violet-700 font-medium mt-0.5">Business · {row.category}</p>
                          </div>
                          {row.verified ? (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <BadgeCheck size={11} /> Verified
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {row.locationLabel || row.city || 'India'}
                        </p>
                      </div>
                    </div>
                    {row.shortDescription ? <p className="text-sm text-slate-500 mt-3 line-clamp-2">{row.shortDescription}</p> : null}
                    {row.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {row.tags.map((tag) => (
                          <span key={tag} className="text-[11px] bg-slate-50 text-violet-700 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                    <a
                      href={publicHref(row.publicPath)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-semibold text-white px-4 py-2 rounded-xl"
                      style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
                    >
                      View Profile
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
