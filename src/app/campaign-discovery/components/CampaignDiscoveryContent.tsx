'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { creatorApi } from '@/src/lib/api';
import { extractList, mapDiscoveryCampaign, type DiscoveryCampaignRow } from '@/src/lib/mappers';
import { applicationBlocksCampaign } from '@/src/lib/applicationUtils';
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, Users, ChevronDown, X, Star, CheckCircle, MapPin, Globe, Brain, ShieldCheck, BadgeCheck, Zap, ArrowUpRight, Sparkles } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import ApplyModal from './ApplyModal';

const platforms = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Pinterest'];
const niches = ['All Niches', 'Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing'];
const localities = ['All Locations', 'USA', 'India', 'UK', 'Germany', 'Japan', 'Singapore', 'Nigeria', 'Spain', 'UAE', 'Global'];
const languages = ['All Languages', 'English', 'Hindi', 'Spanish', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Korean', 'French'];
const deliverableTypes = ['Reel', 'Story', 'Shorts', 'UGC', 'Long-form'];
const paymentTypes = ['Fixed', 'Affiliate', 'Hybrid'];
const brandSizes = ['Startup', 'D2C', 'Enterprise'];

const budgetRanges = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under ₹5K', min: 0, max: 5000 },
  { label: '₹5K – ₹15K', min: 5000, max: 15000 },
  { label: '₹15K – ₹50K', min: 15000, max: 50000 },
  { label: '₹50K+', min: 50000, max: Infinity },
];

const followerRequirements = [
  { label: 'Any', min: 0 },
  { label: '5K+', min: 5000 },
  { label: '10K+', min: 10000 },
  { label: '25K+', min: 25000 },
  { label: '50K+', min: 50000 },
];

type Campaign = DiscoveryCampaignRow;

const recommendedTabs = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'recommended', label: 'Recommended', icon: '⭐' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'high_budget', label: 'High Budget', icon: '💰' },
  { id: 'easy_approval', label: 'Easy Approval', icon: '✅' },
  { id: 'new_brand', label: 'New Brands', icon: '🆕' },
  { id: 'fast_paying', label: 'Fast Paying', icon: '⚡' },
];

export default function CampaignDiscoveryContent() {
  const searchParams = useSearchParams();
  const applyCampaignId = searchParams.get('apply');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedBudget, setSelectedBudget] = useState(0);
  const [selectedLocality, setSelectedLocality] = useState('All Locations');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedFollowers, setSelectedFollowers] = useState(0);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [selectedBrandSizes, setSelectedBrandSizes] = useState<string[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Set<string>>(new Set());
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set());
  const [applyTarget, setApplyTarget] = useState<Campaign | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'budget_low' | 'applicants_low' | 'match'>('match');
  const [activeRecommendedTab, setActiveRecommendedTab] = useState('all');
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const budgetRange = budgetRanges[selectedBudget];
      const sortMap = {
        match: undefined,
        newest: undefined,
        budget_high: 'budget_desc',
        budget_low: 'budget_asc',
        applicants_low: undefined,
      } as const;
      const [campaignsRes, appsRes] = await Promise.all([
        creatorApi.getCampaigns({
          search: search || undefined,
          platform: selectedPlatform !== 'All Platforms' ? selectedPlatform : undefined,
          locality: selectedLocality !== 'All Locations' ? selectedLocality : undefined,
          language: selectedLanguage !== 'All Languages' ? selectedLanguage : undefined,
          budgetMin: budgetRange.min || undefined,
          budgetMax: budgetRange.max === Infinity ? undefined : budgetRange.max,
          sort: sortMap[sortBy],
          includeMatch: true,
          limit: 50,
        }),
        creatorApi.getApplications({ limit: 100 }),
      ]);
      const aiEnabled =
        typeof (campaignsRes as { aiMatchingEnabled?: boolean }).aiMatchingEnabled === 'boolean'
          ? (campaignsRes as { aiMatchingEnabled: boolean }).aiMatchingEnabled
          : true;
      setAiMatchingEnabled(aiEnabled);
      setCampaigns(
        extractList<Record<string, unknown>>(campaignsRes).map((c) =>
          mapDiscoveryCampaign(c, { aiEnabled }),
        ),
      );
      const appliedIds = new Set(
        extractList<Record<string, unknown>>(appsRes)
          .filter((a) => applicationBlocksCampaign(String(a.status ?? '')))
          .map((a) => String(a.campaign_id)),
      );
      setAppliedCampaigns(appliedIds);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [search, selectedPlatform, selectedLocality, selectedLanguage, selectedBudget, sortBy]);

  useEffect(() => {
    if (!aiMatchingEnabled && sortBy === 'match') {
      setSortBy('newest');
    }
  }, [aiMatchingEnabled, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => loadCampaigns(), 300);
    return () => clearTimeout(timer);
  }, [loadCampaigns]);

  useEffect(() => {
    if (!applyCampaignId || loading) return;
    const target = campaigns.find((c) => c.id === applyCampaignId);
    if (target && !appliedCampaigns.has(applyCampaignId)) {
      setApplyTarget(target);
      return;
    }
    if (!target && !appliedCampaigns.has(applyCampaignId)) {
      creatorApi
        .getCampaign(applyCampaignId)
        .then((res) => {
          setApplyTarget(mapDiscoveryCampaign(res as Record<string, unknown>));
        })
        .catch(() => {
          toast.error('Could not load campaign to apply');
        });
    }
  }, [applyCampaignId, loading, campaigns, appliedCampaigns]);

  const toggleMultiFilter = (val: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    const budgetRange = budgetRanges[selectedBudget];
    const followerMin = followerRequirements[selectedFollowers].min;
    return campaigns.filter(c => {
      if (c.status === 'completed') return false;
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
      const matchPlatform =
        selectedPlatform === 'All Platforms' ||
        c.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchNiche =
        selectedNiche === 'All Niches' ||
        c.niche.toLowerCase() === selectedNiche.toLowerCase() ||
        c.niche === 'General';
      const matchBudget = c.budget >= budgetRange.min && c.budget <= budgetRange.max;
      const matchLocality =
        selectedLocality === 'All Locations' ||
        c.locality.toLowerCase() === selectedLocality.toLowerCase() ||
        c.locality === 'Global';
      const matchLanguage =
        selectedLanguage === 'All Languages' ||
        c.language.toLowerCase() === selectedLanguage.toLowerCase();
      const matchFollowers = c.followersMin >= followerMin;
      const matchDeliverables = selectedDeliverables.length === 0 || selectedDeliverables.some(d => c.deliverables.some(del => del.toLowerCase().includes(d.toLowerCase())));
      const matchPayment = selectedPaymentTypes.length === 0 || selectedPaymentTypes.includes(c.paymentType);
      const matchBrandSize = selectedBrandSizes.length === 0 || selectedBrandSizes.includes(c.brandSize);
      return matchSearch && matchPlatform && matchNiche && matchBudget && matchLocality && matchLanguage && matchFollowers && matchDeliverables && matchPayment && matchBrandSize;
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return b.budget - a.budget;
      if (sortBy === 'budget_low') return a.budget - b.budget;
      if (sortBy === 'applicants_low') return a.applicants - b.applicants;
      if (sortBy === 'match') return b.aiMatchScore - a.aiMatchScore;
      return 0;
    });
  }, [campaigns, search, selectedPlatform, selectedNiche, selectedBudget, selectedLocality, selectedLanguage, selectedFollowers, selectedDeliverables, selectedPaymentTypes, selectedBrandSizes, sortBy]);

  const recommendedFiltered = useMemo(() => {
    const list =
      activeRecommendedTab === 'all'
        ? [...campaigns]
        : campaigns.filter((c) => c.category === activeRecommendedTab);
    return list.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  }, [campaigns, activeRecommendedTab]);

  const toggleSave = (id: string) => {
    setSavedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info('Removed from saved'); }
      else { next.add(id); toast.success('Campaign saved'); }
      return next;
    });
  };

  const handleApplySuccess = (campaignId: string) => {
    setAppliedCampaigns(prev => new Set(prev).add(campaignId));
    setApplyTarget(null);
    toast.success('Application submitted! The brand will review it shortly.');
  };

  const activeFilters = [
    selectedPlatform !== 'All Platforms' && selectedPlatform,
    selectedNiche !== 'All Niches' && selectedNiche,
    selectedBudget > 0 && budgetRanges[selectedBudget].label,
    selectedLocality !== 'All Locations' && selectedLocality,
    selectedLanguage !== 'All Languages' && selectedLanguage,
    selectedFollowers > 0 && followerRequirements[selectedFollowers].label,
    ...selectedDeliverables,
    ...selectedPaymentTypes,
    ...selectedBrandSizes,
  ].filter(Boolean) as string[];

  const approvalChanceConfig = {
    High: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'High Approval Chance' },
    Medium: { cls: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium Chance' },
    Low: { cls: 'bg-red-100 text-red-700 border-red-200', label: 'Low Chance' },
  };

  const renderCampaignCard = (campaign: Campaign) => {
    const isApplied = appliedCampaigns.has(campaign.id);
    const isSaved = savedCampaigns.has(campaign.id);
    const slotsLeft = campaign.slots - Math.floor(campaign.applicants / 5);
    const isUrgent = slotsLeft <= 2;

    return (
      <div key={campaign.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group ${campaign.featured ? 'border-violet-300 ring-1 ring-violet-200 shadow-md' : 'border-slate-200'}`}>
        {campaign.featured && (
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-600">Featured Campaign</span>
          </div>
        )}

        <div className="p-4 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${campaign.featured ? 'bg-gradient-to-br from-violet-100 to-purple-100' : 'bg-violet-100'}`}>
                <span className="text-violet-700 text-xs font-bold">{campaign.brandLogo}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{campaign.title}</h3>
                  {campaign.verifiedBrand && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{campaign.brand}</p>
              </div>
            </div>
            <button onClick={() => toggleSave(campaign.id)} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
              {isSaved ? <BookmarkCheck size={16} className="text-violet-600" /> : <Bookmark size={16} className="text-slate-400" />}
            </button>
          </div>

          {aiMatchingEnabled && campaign.aiMatchScore > 0 && (
            <>
              <div className={`flex items-center justify-between p-2.5 rounded-xl mb-3 border ${campaign.aiMatchScore >= 90 ? 'bg-violet-50 border-violet-200' : campaign.aiMatchScore >= 75 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Brain size={13} className={campaign.aiMatchScore >= 90 ? 'text-violet-600' : 'text-slate-500'} />
                  <span className="text-xs font-semibold text-slate-700">AI Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${campaign.aiMatchScore >= 90 ? 'bg-violet-500' : campaign.aiMatchScore >= 75 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${campaign.aiMatchScore}%` }} />
                  </div>
                  <span className={`text-sm font-black ${campaign.aiMatchScore >= 90 ? 'text-violet-700' : 'text-slate-700'}`}>{campaign.aiMatchScore}%</span>
                </div>
              </div>
              {campaign.matchReason && (
                <p className="text-xs text-slate-500 italic mb-3 leading-relaxed line-clamp-2">&quot;{campaign.matchReason}&quot;</p>
              )}
            </>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PlatformBadge platform={campaign.platform} />
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">{campaign.niche}</span>
          </div>

          {/* Locality + Language */}
          <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{campaign.locality}</span>
            <span className="flex items-center gap-1"><Globe size={11} className="text-slate-400" />{campaign.language}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-emerald-50 rounded-xl p-2 text-center">
              <p className="text-xs font-black text-emerald-700 tabular-nums">₹{(campaign.earnAmount / 100 * 8.3).toFixed(0)}K</p>
              <p className="text-xs text-slate-400">Earn</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Users size={10} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800 tabular-nums">{campaign.applicants}</span>
              </div>
              <p className="text-xs text-slate-400">applied</p>
            </div>
            <div className={`rounded-xl p-2 text-center ${isUrgent ? 'bg-red-50' : 'bg-slate-50'}`}>
              <p className={`text-xs font-bold tabular-nums ${isUrgent ? 'text-red-700' : 'text-slate-800'}`}>{slotsLeft > 0 ? slotsLeft : '!'}</p>
              <p className="text-xs text-slate-400">slots</p>
            </div>
          </div>

          {/* Brand Trust Indicators */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {campaign.verifiedBrand && (
              <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                <BadgeCheck size={10} />Verified Brand
              </span>
            )}
            {campaign.escrowProtected && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck size={10} />Escrow Secured
              </span>
            )}
            {campaign.avgPaymentDays <= 3 && (
              <span className="flex items-center gap-1 text-xs text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                <Zap size={10} />Pays in {campaign.avgPaymentDays}d
              </span>
            )}
          </div>

          {/* Social Proof */}
          <div className="bg-slate-50 rounded-xl p-2.5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1"><Users size={10} />{campaign.applicants} applied</span>
              <span className="text-slate-500">{campaign.previouslySelected} selected</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1"><Star size={10} className="fill-amber-400" />{campaign.creatorSatisfaction}</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">Creators earned {campaign.totalCreatorsEarned} from this brand</p>
          </div>

          {/* Real-time activity */}
          {campaign.viewingNow > 1 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-slate-500">{campaign.viewingNow} creators viewing now</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-0">
          <div className="pt-3 border-t border-slate-100">
            {/* Approval chance badge */}
            <div className={`flex items-center justify-between mb-2.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${approvalChanceConfig[campaign.approvalChance].cls}`}>
              <span>{approvalChanceConfig[campaign.approvalChance].label}</span>
              {isUrgent && <span className="text-red-600 font-bold animate-pulse">Only {slotsLeft} Slots Left!</span>}
            </div>

            {isApplied ? (
              <span className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-200">
                <CheckCircle size={13} />Applied Successfully
              </span>
            ) : (
              <button
                onClick={() => setApplyTarget(campaign)}
                className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97] ${aiMatchingEnabled && campaign.aiMatchScore >= 90 ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-200' : 'bg-violet-600 hover:bg-violet-700'}`}
              >
                Apply & Earn ₹{(campaign.earnAmount / 100 * 8.3).toFixed(0)}K
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header + Monthly Earnings Snapshot */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Discovery</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading campaigns...' : `Browse ${campaigns.length} active campaigns — matched to your profile`}
          </p>
        </div>
        {/* Monthly Earnings Snapshot */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl px-5 py-3 text-white shadow-lg">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide mb-1">This Month</p>
          <p className="text-2xl font-black tabular-nums">₹48,200</p>
          <div className="flex items-center gap-1 mt-0.5">
            <ArrowUpRight size={12} className="text-emerald-200" />
            <p className="text-emerald-200 text-xs font-semibold">+18% vs last month</p>
          </div>
        </div>
      </div>

      {/* Recommended For You Section */}
      <div className="bg-white rounded-2xl border border-violet-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-600" />
            <h2 className="text-sm font-bold text-slate-800">Recommended For You</h2>
            <span className="text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full font-semibold">AI Curated</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-100 overflow-x-auto">
          {recommendedTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRecommendedTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${activeRecommendedTab === tab.id ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recommendedFiltered.slice(0, 3).map(c => renderCampaignCard(c))}
          </div>
        </div>
      </div>

      {/* Search + sort bar */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns or brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700"
          >
            {aiMatchingEnabled && <option value="match">Best AI Match</option>}
            <option value="newest">Newest First</option>
            <option value="budget_high">Budget: High to Low</option>
            <option value="budget_low">Budget: Low to High</option>
            <option value="applicants_low">Fewest Applicants</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Myntra-style filters: 3 primary + More Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Platform</label>
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Budget</label>
            <select
              value={selectedBudget}
              onChange={e => setSelectedBudget(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {budgetRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Location</label>
            <select
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {localities.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowMoreFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${showMoreFilters ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal size={15} />
            More Filters
            {activeFilters.length > 3 && (
              <span className="bg-violet-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters.length - 3}
              </span>
            )}
            {showMoreFilters ? <ChevronDown size={14} className="rotate-180" /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showMoreFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Niche</label>
              <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                {niches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Language</label>
              <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Followers</label>
              <select value={selectedFollowers} onChange={e => setSelectedFollowers(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                {followerRequirements.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Deliverables</p>
              <div className="flex flex-wrap gap-2">
                {deliverableTypes.map(d => (
                  <label key={d} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={selectedDeliverables.includes(d)} onChange={() => toggleMultiFilter(d, selectedDeliverables, setSelectedDeliverables)} className="accent-violet-600" />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment Type</p>
              <div className="flex flex-wrap gap-2">
                {paymentTypes.map(p => (
                  <label key={p} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={selectedPaymentTypes.includes(p)} onChange={() => toggleMultiFilter(p, selectedPaymentTypes, setSelectedPaymentTypes)} className="accent-violet-600" />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Brand Size</p>
              <div className="flex flex-wrap gap-2">
                {brandSizes.map(b => (
                  <label key={b} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={selectedBrandSizes.includes(b)} onChange={() => toggleMultiFilter(b, selectedBrandSizes, setSelectedBrandSizes)} className="accent-violet-600" />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500">Active filters:</span>
          {activeFilters.map(f => (
            <span key={`chip-${f}`} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">
              {f}
              <button onClick={() => {
                if (f === selectedPlatform) setSelectedPlatform('All Platforms');
                if (f === selectedNiche) setSelectedNiche('All Niches');
                if (f === budgetRanges[selectedBudget].label) setSelectedBudget(0);
                if (f === selectedLocality) setSelectedLocality('All Locations');
                if (f === selectedLanguage) setSelectedLanguage('All Languages');
                if (f === followerRequirements[selectedFollowers].label) setSelectedFollowers(0);
                if (selectedDeliverables.includes(f)) setSelectedDeliverables(selectedDeliverables.filter(x => x !== f));
                if (selectedPaymentTypes.includes(f)) setSelectedPaymentTypes(selectedPaymentTypes.filter(x => x !== f));
                if (selectedBrandSizes.includes(f)) setSelectedBrandSizes(selectedBrandSizes.filter(x => x !== f));
              }}><X size={11} /></button>
            </span>
          ))}
          <button onClick={() => { setSelectedPlatform('All Platforms'); setSelectedNiche('All Niches'); setSelectedBudget(0); setSelectedLocality('All Locations'); setSelectedLanguage('All Languages'); setSelectedFollowers(0); setSelectedDeliverables([]); setSelectedPaymentTypes([]); setSelectedBrandSizes([]); }} className="text-xs text-slate-500 hover:text-slate-700 underline">Clear all</button>
        </div>
      )}

      <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 font-medium">{filtered.length} campaigns found</p>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
              <Search size={40} className="text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-semibold mb-1">No campaigns found</h3>
              <p className="text-slate-400 text-sm text-center max-w-xs">Try adjusting your filters or search term to find matching campaigns.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map(campaign => renderCampaignCard(campaign))}
            </div>
          )}
      </div>

      {applyTarget && (
        <ApplyModal campaign={applyTarget} onClose={() => setApplyTarget(null)} onSuccess={() => handleApplySuccess(applyTarget.id)} />
      )}
    </div>
  );
}