'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Package,
  Wallet,
  Loader2,
  BadgeCheck,
  TrendingUp,
  Megaphone,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { listingApi } from '@/src/lib/api';
import { toast } from 'sonner';

type Suggestions = Awaited<ReturnType<typeof listingApi.getSuggestions>>;
const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://viralbridgge-new.vercel.app';
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chennai', 'Kolkata', 'Noida', 'Gurgaon', 'Jaipur', 'Lucknow'];
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati'];
const CATEGORIES = ['Beauty', 'Fitness', 'Food', 'Fashion', 'Travel', 'Tech', 'Lifestyle', 'Education', 'Health'];

const OBJECTIVES = [
  { id: 'store_visits', label: 'More store visits', hint: 'Bring more people to your shop or location' },
  { id: 'enquiries', label: 'More enquiries', hint: 'Get more WhatsApp, call, and form leads' },
  { id: 'sales', label: 'More sales', hint: 'Drive purchases and conversions' },
  { id: 'followers', label: 'More followers', hint: 'Grow your social audience' },
  { id: 'reviews', label: 'More reviews', hint: 'Build trust with ratings' },
  { id: 'awareness', label: 'Brand awareness', hint: 'Get your brand seen by more people' },
] as const;

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'popular', label: 'Popular' },
  { id: 'rating', label: 'Top rated' },
  { id: 'newest', label: 'Newest' },
] as const;

type FilterKey = 'budget' | 'place' | 'relevance' | 'more' | null;

function formatFollowers(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value || 0);
}

function publicHref(path: string) {
  return `${PUBLIC_SITE}${path}`;
}

export default function GrowBusinessContent() {
  const [step, setStep] = useState<'objective' | 'results'>('objective');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [place, setPlace] = useState<string>('');
  const [sort, setSort] = useState<string>('relevance');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterKey>(null);

  const objectiveLabel = useMemo(
    () => OBJECTIVES.filter((item) => selectedObjectives.includes(item.id)).map((item) => item.label).join(', '),
    [selectedObjectives],
  );

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const loadSuggestions = async (overrides?: {
    budgetMin?: number;
    budgetMax?: number | null;
    place?: string;
    sort?: string;
    category?: string;
    language?: string;
    featuredOnly?: boolean;
    objectives?: string[];
  }) => {
    const nextMin = overrides?.budgetMin !== undefined ? overrides.budgetMin || undefined : budgetMin;
    const nextMax = overrides && 'budgetMax' in overrides ? overrides.budgetMax ?? undefined : budgetMax;
    const nextPlace = overrides?.place !== undefined ? overrides.place : place;
    const nextSort = overrides?.sort ?? sort;
    const nextCategory = overrides?.category !== undefined ? overrides.category : category;
    const nextLanguage = overrides?.language !== undefined ? overrides.language : language;
    const nextFeatured = overrides?.featuredOnly ?? featuredOnly;
    const nextObjectives = overrides?.objectives ?? selectedObjectives;

    setLoading(true);
    try {
      const data = await listingApi.getSuggestions({
        budgetMin: nextMin,
        budgetMax: nextMax,
        city: nextPlace || undefined,
        sort: nextSort,
        objective: nextObjectives.join(',') || undefined,
        category: nextCategory || undefined,
        language: nextLanguage || undefined,
        featured: nextFeatured ? 'true' : undefined,
      });
      setSuggestions(data);
      if (!place && data.listingCity) setPlace(data.listingCity);
      if (!overrides?.sort && data.sort) setSort(data.sort);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const proceed = () => {
    if (selectedObjectives.length === 0) {
      toast.error('Select at least one business objective to continue');
      return;
    }
    setStep('results');
    void loadSuggestions({ objectives: selectedObjectives });
  };

  const extraCount = Number(Boolean(category)) + Number(Boolean(language)) + Number(featuredOnly);

  return (
    <div className="pb-8">
      {step === 'objective' ? (
        <div className="max-w-xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5">
              <Megaphone size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Want more customers?</h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Promote your business with relevant creators and reach thousands of new customers. Choose what you want to grow first.
            </p>

            <div className="mt-6 space-y-2.5">
              {OBJECTIVES.map((item) => {
                const active = selectedObjectives.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleObjective(item.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      active ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-violet-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          active ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 text-transparent'
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{item.hint}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={proceed}
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-2xl disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Promote My Business
            </button>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Need a listing first?{' '}
              <Link href="/my-listing" className="text-violet-700 font-semibold">
                Manage my listing
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white">
            <button
              type="button"
              onClick={() => {
                setOpenFilter(null);
                setStep('objective');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-100 hover:text-white"
            >
              <ArrowLeft size={14} />
              Change objective
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Creator recommendations</h1>
            <p className="text-sm text-violet-100 mt-2 max-w-2xl">
              {objectiveLabel ? `Showing matches for ${objectiveLabel}.` : 'Creator matches based on your listing.'} Use filters to refine budget, place, and relevance.
            </p>
          </div>

          <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                label={budgetMin != null || budgetMax != null ? suggestions?.budget.bands.find((band) => band.min === (budgetMin ?? 0) && band.max === (budgetMax ?? null))?.label || 'Budget' : 'Budget'}
                active={budgetMin != null || budgetMax != null}
                open={openFilter === 'budget'}
                onClick={() => setOpenFilter((value) => (value === 'budget' ? null : 'budget'))}
                icon={Wallet}
              />
              <FilterChip
                label={place && place !== 'all' ? place : 'Place'}
                active={Boolean(place && place !== 'all')}
                open={openFilter === 'place'}
                onClick={() => setOpenFilter((value) => (value === 'place' ? null : 'place'))}
                icon={MapPin}
              />
              <FilterChip
                label={SORTS.find((item) => item.id === sort)?.label || 'Relevance'}
                active={sort !== 'relevance'}
                open={openFilter === 'relevance'}
                onClick={() => setOpenFilter((value) => (value === 'relevance' ? null : 'relevance'))}
                icon={TrendingUp}
              />
              <FilterChip
                label={extraCount ? `More (${extraCount})` : 'Add more'}
                active={extraCount > 0}
                open={openFilter === 'more'}
                onClick={() => setOpenFilter((value) => (value === 'more' ? null : 'more'))}
                icon={SlidersHorizontal}
              />
            </div>

            {openFilter === 'budget' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBudgetMin(undefined);
                    setBudgetMax(undefined);
                    void loadSuggestions({ budgetMin: 0, budgetMax: null });
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border ${budgetMin == null && budgetMax == null ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600'}`}
                >
                  Any budget
                </button>
                {(suggestions?.budget.bands ?? [
                  { label: 'Under ₹5,000', min: 0, max: 5000 },
                  { label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
                  { label: '₹15,000 – ₹50,000', min: 15000, max: 50000 },
                  { label: '₹50,000+', min: 50000, max: null },
                ]).map((band) => {
                  const active = budgetMin === band.min && budgetMax === (band.max ?? undefined);
                  return (
                    <button
                      key={band.label}
                      type="button"
                      onClick={() => {
                        setBudgetMin(band.min || undefined);
                        setBudgetMax(band.max ?? undefined);
                        void loadSuggestions({ budgetMin: band.min, budgetMax: band.max });
                      }}
                      className={`text-sm px-3 py-1.5 rounded-full border ${active ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}
                    >
                      {band.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {openFilter === 'place' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlace('all');
                    void loadSuggestions({ place: 'all' });
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border ${place === 'all' || !place ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600'}`}
                >
                  All India
                </button>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setPlace(city);
                      void loadSuggestions({ place: city });
                    }}
                    className={`text-sm px-3 py-1.5 rounded-full border ${place === city ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            ) : null}

            {openFilter === 'relevance' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {SORTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSort(item.id);
                      void loadSuggestions({ sort: item.id });
                    }}
                    className={`text-sm px-3 py-1.5 rounded-full border ${sort === item.id ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 text-slate-600 hover:border-violet-300'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            {openFilter === 'more' ? (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <label className="text-xs font-medium text-slate-600">
                  Category
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      void loadSuggestions({ category: e.target.value });
                    }}
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Any category</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-600">
                  Language
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      void loadSuggestions({ language: e.target.value });
                    }}
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Any language</option>
                    {LANGUAGES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-600 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => {
                      setFeaturedOnly(e.target.checked);
                      void loadSuggestions({ featuredOnly: e.target.checked });
                    }}
                  />
                  Premium creators only
                </label>
              </div>
            ) : null}
          </div>

          {loading && !suggestions ? (
            <p className="mt-6 text-sm text-slate-500 inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Finding creators for your objective…
            </p>
          ) : null}

          {suggestions ? (
            <div className="mt-6 space-y-5">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-violet-600" />
                  <h2 className="font-semibold text-slate-800">Recommended creators</h2>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {suggestions.city ? `Matching ${suggestions.city}` : 'Showing top available creators'}
                  {loading ? ' · Updating…' : ''}
                </p>
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
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  open,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
  icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border transition-colors ${
        open || active ? 'bg-violet-50 text-violet-700 border-violet-200' : 'border-slate-200 text-slate-600 hover:border-violet-200'
      }`}
    >
      <Icon size={14} />
      {label}
      <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
    </button>
  );
}
