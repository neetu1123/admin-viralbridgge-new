'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Package, Wallet, Loader2 } from 'lucide-react';
import { listingApi } from '@/src/lib/api';
import { toast } from 'sonner';

type Suggestions = Awaited<ReturnType<typeof listingApi.getSuggestions>>;

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
        toast.message('Add a city and category on My Listing for closer matches.');
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
          Click the CTA to load AI suggestions. Complete your listing first for better nearby matches.
          <div className="mt-3">
            <Link href="/my-listing" className="text-violet-700 font-semibold">Open My Listing</Link>
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

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-violet-600" />
              <h2 className="font-semibold text-slate-800">Available creators nearby</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">{suggestions.city ? `Matching ${suggestions.city}` : 'Showing top available creators'}</p>
            {suggestions.nearbyCreators.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">No creators found for this filter yet.</p>
            ) : (
              <ul className="mt-3 divide-y">
                {suggestions.nearbyCreators.map((creator) => (
                  <li key={creator.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{creator.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[creator.niche, creator.city, creator.estimatedBudget].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <a
                      href={`https://viralbridgge-new.vercel.app${creator.publicPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-violet-700"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-violet-600" />
              <h2 className="font-semibold text-slate-800">Related products or services</h2>
            </div>
            {suggestions.relatedProducts.length === 0 ? (
              <p className="text-sm text-slate-500 mt-3">Add services on your listing to see related suggestions.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.relatedProducts.map((item) => (
                  <span key={item} className="text-xs font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">{item}</span>
                ))}
              </div>
            )}
            {suggestions.relatedListings.length > 0 ? (
              <ul className="mt-4 divide-y">
                {suggestions.relatedListings.map((row) => (
                  <li key={row.id} className="py-3">
                    <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{[row.category, row.city].filter(Boolean).join(' · ')}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
