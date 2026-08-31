'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { brandApi } from '@/src/lib/api';
import { extractList, extractMeta, mapCreatorCard, type CreatorCardRow } from '@/src/lib/mappers';
import { Search, SlidersHorizontal, Users, Star, MessageSquare, UserPlus, ChevronDown, X, MapPin, Globe, Plus } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import InviteCreatorModal from './InviteCreatorModal';

type Creator = CreatorCardRow;

const niches = ['All Niches', 'Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing'];
const platforms = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Pinterest'];
const locations = ['All Locations', 'USA', 'India', 'UK', 'Germany', 'Japan', 'Singapore', 'Nigeria', 'Spain', 'UAE', 'South Korea'];
const languages = ['All Languages', 'English', 'Hindi', 'Spanish', 'German', 'Japanese', 'Mandarin', 'Arabic', 'Korean', 'French'];

const followerRanges = [
  { label: 'Any Size', min: 0, max: Infinity },
  { label: 'Nano (1K–10K)', min: 1000, max: 10000 },
  { label: 'Micro (10K–100K)', min: 10000, max: 100000 },
  { label: 'Mid (100K–500K)', min: 100000, max: 500000 },
  { label: 'Macro (500K+)', min: 500000, max: Infinity },
];

const engagementRanges = [
  { label: 'Any Rate', min: 0 },
  { label: '2%+', min: 2 },
  { label: '4%+', min: 4 },
  { label: '6%+', min: 6 },
  { label: '8%+', min: 8 },
];

const priceRanges = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–₹1,500', min: 500, max: 1500 },
  { label: '₹1,500–₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000+', min: 3000, max: Infinity },
];

export default function CreatorDiscoveryContent() {
  const searchParams = useSearchParams();
  const inviteCreatorId = searchParams.get('invite');
  const inviteHandle = searchParams.get('handle');
  const inviteName = searchParams.get('name');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedFollowers, setSelectedFollowers] = useState(0);
  const [selectedEngagement, setSelectedEngagement] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'followers' | 'engagement' | 'price_low' | 'price_high'>('match');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [invitedCreators, setInvitedCreators] = useState<Set<string>>(new Set());
  const [inviteModalTarget, setInviteModalTarget] = useState<{ id: string; name?: string; handle?: string } | null>(null);
  const [totalCreators, setTotalCreators] = useState(0);
  const [showCampaignPrompt, setShowCampaignPrompt] = useState(false);

  useEffect(() => {
    let scrollTicks = 0;
    const onScroll = () => {
      scrollTicks += 1;
      if (scrollTicks >= 10) setShowCampaignPrompt(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(() => setShowCampaignPrompt(true), 40000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      const followerRange = followerRanges[selectedFollowers];
      const sortMap = {
        match: undefined,
        followers: 'followers',
        engagement: 'engagement',
        price_low: undefined,
        price_high: undefined,
      } as const;
      const res = await brandApi.getCreators({
        search: search || undefined,
        niche: selectedNiche !== 'All Niches' ? selectedNiche : undefined,
        platform: selectedPlatform !== 'All Platforms' ? selectedPlatform : undefined,
        locality: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
        language: selectedLanguage !== 'All Languages' ? selectedLanguage : undefined,
        followersMin: followerRange.min || undefined,
        followersMax: followerRange.max === Infinity ? undefined : followerRange.max,
        engagementMin: engagementRanges[selectedEngagement].min || undefined,
        sort: sortMap[sortBy],
        limit: 50,
      });
      const rawList = extractList<Record<string, unknown>>(res);
      setCreators(rawList.map(mapCreatorCard));
      setTotalCreators(extractMeta(res).total ?? rawList.length);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [search, selectedNiche, selectedPlatform, selectedLocation, selectedLanguage, selectedFollowers, selectedEngagement, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => loadCreators(), 300);
    return () => clearTimeout(timer);
  }, [loadCreators]);

  useEffect(() => {
    if (!inviteCreatorId || loading || invitedCreators.has(inviteCreatorId)) return;
    const target = creators.find((c) => c.id === inviteCreatorId);
    if (target) {
      setInviteModalTarget({ id: target.id, name: target.name, handle: target.handle });
      return;
    }
    setInviteModalTarget({
      id: inviteCreatorId,
      name: inviteName ?? undefined,
      handle: inviteHandle ?? undefined,
    });
  }, [inviteCreatorId, inviteHandle, inviteName, loading, creators, invitedCreators]);

  const filtered = useMemo(() => {
    return creators.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()) || c.niche.toLowerCase().includes(search.toLowerCase());
      const matchNiche =
        selectedNiche === 'All Niches' ||
        c.niche === selectedNiche ||
        c.niche.toLowerCase().includes(selectedNiche.split('&')[0].trim().toLowerCase()) ||
        selectedNiche.toLowerCase().includes(c.niche.toLowerCase());
      const matchPlatform = selectedPlatform === 'All Platforms' || c.platform === selectedPlatform;
      const matchLocation = selectedLocation === 'All Locations' || c.location.includes(selectedLocation);
      const matchLanguage = selectedLanguage === 'All Languages' || c.language.includes(selectedLanguage);
      const followerRange = followerRanges[selectedFollowers];
      const matchFollowers = c.followers >= followerRange.min && c.followers <= followerRange.max;
      const engMin = engagementRanges[selectedEngagement].min;
      const matchEngagement = c.engagementRate >= engMin;
      const priceRange = priceRanges[selectedPrice];
      const matchPrice = c.pricePerPost >= priceRange.min && c.pricePerPost <= priceRange.max;
      return matchSearch && matchNiche && matchPlatform && matchLocation && matchLanguage && matchFollowers && matchEngagement && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'followers') return b.followers - a.followers;
      if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
      if (sortBy === 'price_low') return a.pricePerPost - b.pricePerPost;
      if (sortBy === 'price_high') return b.pricePerPost - a.pricePerPost;
      return b.rating - a.rating;
    });
  }, [creators, search, selectedNiche, selectedPlatform, selectedLocation, selectedLanguage, selectedFollowers, selectedEngagement, selectedPrice, sortBy]);

  const handleInvite = (creator: Creator) => {
    setInviteModalTarget({ id: creator.id, name: creator.name, handle: creator.handle });
  };

  const handleInviteSuccess = (creatorId: string) => {
    setInvitedCreators((prev) => new Set(prev).add(creatorId));
  };

  const activeFilters = [
    selectedPlatform !== 'All Platforms' && selectedPlatform,
    selectedNiche !== 'All Niches' && selectedNiche,
    selectedLocation !== 'All Locations' && selectedLocation,
    selectedLanguage !== 'All Languages' && selectedLanguage,
    selectedFollowers > 0 && followerRanges[selectedFollowers].label,
    selectedEngagement > 0 && engagementRanges[selectedEngagement].label,
    selectedPrice > 0 && priceRanges[selectedPrice].label,
  ].filter(Boolean) as string[];

  const clearAll = () => {
    setSelectedNiche('All Niches');
    setSelectedPlatform('All Platforms');
    setSelectedLocation('All Locations');
    setSelectedLanguage('All Languages');
    setSelectedFollowers(0);
    setSelectedEngagement(0);
    setSelectedPrice(0);
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Creator Discovery</h1>
          <p className="text-slate-500 text-sm mt-1">Find and invite the perfect creators for your campaigns</p>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
          {loading ? '...' : `${filtered.length} of ${totalCreators || creators.length} creators`}
        </span>
      </div>

      {/* Search + sort bar */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators by name, handle, or niche..."
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
            <option value="match">Best Match</option>
            <option value="followers">Most Followers</option>
            <option value="engagement">Highest Engagement</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Primary filters — same layout as campaign discovery */}
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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Followers</label>
            <select
              value={selectedFollowers}
              onChange={e => setSelectedFollowers(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {followerRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Location</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
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
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Engagement Rate</label>
              <select value={selectedEngagement} onChange={e => setSelectedEngagement(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                {engagementRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Price per Post</label>
              <select value={selectedPrice} onChange={e => setSelectedPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                {priceRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
              </select>
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
                if (f === selectedLocation) setSelectedLocation('All Locations');
                if (f === selectedLanguage) setSelectedLanguage('All Languages');
                if (f === followerRanges[selectedFollowers].label) setSelectedFollowers(0);
                if (f === engagementRanges[selectedEngagement].label) setSelectedEngagement(0);
                if (f === priceRanges[selectedPrice].label) setSelectedPrice(0);
              }}><X size={11} /></button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 underline">Clear all</button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <p className="text-sm text-slate-500 font-medium">
          {loading ? 'Loading creators…' : `${filtered.length} creators found`}
        </p>
      </div>

      {/* Creator Grid */}
      <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200">
              <Users size={40} className="text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-semibold mb-1">No creators found</h3>
              <p className="text-slate-400 text-sm text-center max-w-xs">Try adjusting your filters to find matching creators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map(creator => {
                const isInvited = invitedCreators.has(creator.id);
                return (
                  <div key={creator.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
                    <div className="p-4 flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-700 text-sm font-bold">{creator.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-800 truncate">{creator.name}</p>
                            {creator.verified && (
                              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-xs text-violet-600 font-medium">{creator.handle}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <PlatformBadge platform={creator.platform} />
                            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">{creator.niche}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-slate-700">{creator.rating}</span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{creator.bio}</p>

                      {/* Location + Language */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={11} className="text-slate-400" />
                          {creator.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Globe size={11} className="text-slate-400" />
                          {creator.language}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <p className="text-xs font-bold text-slate-800 tabular-nums">{creator.followers >= 1000000 ? `${(creator.followers / 1000000).toFixed(1)}M` : `${(creator.followers / 1000).toFixed(1)}K`}</p>
                          <p className="text-xs text-slate-400">followers</p>
                        </div>
                        <div className={`rounded-lg p-2 text-center ${creator.engagementRate >= 5 ? 'bg-emerald-50' : creator.engagementRate >= 3 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                          <p className={`text-xs font-bold tabular-nums ${creator.engagementRate >= 5 ? 'text-emerald-700' : creator.engagementRate >= 3 ? 'text-amber-700' : 'text-slate-800'}`}>{creator.engagementRate}%</p>
                          <p className="text-xs text-slate-400">engagement</p>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-2 text-center">
                          <p className="text-xs font-bold text-violet-700 tabular-nums">₹{creator.pricePerPost.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">per post</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {creator.tags.map(tag => (
                          <span key={tag} className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 pb-4 pt-0">
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        {isInvited ? (
                          <span className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 py-2 rounded-lg">
                            ✓ Invited to Campaign
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInvite(creator)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                          >
                            <UserPlus size={13} />
                            Invite to Campaign
                          </button>
                        )}
                        <button
                          onClick={() => toast.info(`Opening message with ${creator.name}`)}
                          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                          <MessageSquare size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {showCampaignPrompt && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm bg-white border border-violet-200 shadow-xl rounded-2xl p-4 animate-in slide-in-from-bottom-4">
          <button
            type="button"
            onClick={() => setShowCampaignPrompt(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
          <p className="text-sm font-bold text-slate-800 pr-6">Ready to launch a campaign?</p>
          <p className="text-xs text-slate-500 mt-1 mb-3">You found great creators — create a campaign to start collaborating.</p>
          <Link
            href="/brand-campaign-management"
            className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> Create Campaign
          </Link>
        </div>
      )}

      {inviteModalTarget && (
        <InviteCreatorModal
          creatorId={inviteModalTarget.id}
          creatorName={inviteModalTarget.name}
          creatorHandle={inviteModalTarget.handle}
          onClose={() => setInviteModalTarget(null)}
          onSuccess={() => handleInviteSuccess(inviteModalTarget.id)}
        />
      )}
    </div>
  );
}
