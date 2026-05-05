'use client';
import React, { useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, SlidersHorizontal, Users, TrendingUp, Star, MessageSquare, UserPlus, ChevronDown, X, MapPin, Globe, DollarSign, Filter } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  platform: string;
  followers: number;
  engagementRate: number;
  avgViews: number;
  location: string;
  language: string;
  pricePerPost: number;
  rating: number;
  pastCollabs: number;
  bio: string;
  tags: string[];
  verified: boolean;
}

const creators: Creator[] = [
  { id: 'cr-001', name: 'Sofia Martinez', handle: '@sofiaglows', avatar: 'SM', niche: 'Beauty & Skincare', platform: 'Instagram', followers: 48200, engagementRate: 5.2, avgViews: 32000, location: 'New York, USA', language: 'English', pricePerPost: 1100, rating: 4.8, pastCollabs: 8, bio: 'Skincare enthusiast sharing honest reviews and routines for 5+ years.', tags: ['skincare', 'beauty', 'wellness'], verified: true },
  { id: 'cr-002', name: 'Priya Nair', handle: '@priyabeauty', avatar: 'PN', niche: 'Beauty & Skincare', platform: 'Instagram', followers: 92100, engagementRate: 4.1, avgViews: 58000, location: 'Mumbai, India', language: 'Hindi, English', pricePerPost: 1500, rating: 4.5, pastCollabs: 12, bio: 'Beauty creator with 78% female audience aged 22-35. High conversion rates.', tags: ['beauty', 'makeup', 'lifestyle'], verified: true },
  { id: 'cr-003', name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', niche: 'Beauty & Skincare', platform: 'Instagram', followers: 31500, engagementRate: 6.8, avgViews: 24000, location: 'Lagos, Nigeria', language: 'English', pricePerPost: 900, rating: 4.9, pastCollabs: 5, bio: 'Melanin-rich skincare specialist with a highly engaged community.', tags: ['skincare', 'melanin', 'afrobeauty'], verified: false },
  { id: 'cr-004', name: 'Mei-Lin Chen', handle: '@meilinskin', avatar: 'MC', niche: 'Beauty & Skincare', platform: 'Instagram', followers: 22800, engagementRate: 7.3, avgViews: 18000, location: 'Singapore', language: 'English, Mandarin', pricePerPost: 800, rating: 4.7, pastCollabs: 3, bio: 'Micro-influencer with exceptional ROI. 200%+ sell-through on past brand deals.', tags: ['skincare', 'kbeauty', 'routine'], verified: false },
  { id: 'cr-005', name: 'Jake Thompson', handle: '@jakefitness', avatar: 'JT', niche: 'Fitness & Wellness', platform: 'YouTube', followers: 156000, engagementRate: 3.8, avgViews: 95000, location: 'Los Angeles, USA', language: 'English', pricePerPost: 3200, rating: 4.6, pastCollabs: 18, bio: 'Certified personal trainer creating science-backed fitness content.', tags: ['fitness', 'gym', 'nutrition'], verified: true },
  { id: 'cr-006', name: 'Yuki Tanaka', handle: '@yukibeauty', avatar: 'YT', niche: 'Beauty & Skincare', platform: 'Instagram', followers: 67400, engagementRate: 4.6, avgViews: 44000, location: 'Tokyo, Japan', language: 'Japanese, English', pricePerPost: 1300, rating: 4.6, pastCollabs: 7, bio: 'J-beauty expert blending Japanese skincare with Western trends.', tags: ['jbeauty', 'skincare', 'japan'], verified: true },
  { id: 'cr-007', name: 'Carlos Rivera', handle: '@carlostravel', avatar: 'CR', niche: 'Travel & Adventure', platform: 'Instagram', followers: 84300, engagementRate: 4.9, avgViews: 61000, location: 'Barcelona, Spain', language: 'Spanish, English', pricePerPost: 1800, rating: 4.7, pastCollabs: 14, bio: 'Full-time travel creator documenting hidden gems across 60+ countries.', tags: ['travel', 'adventure', 'photography'], verified: true },
  { id: 'cr-008', name: 'Amara Johnson', handle: '@amaracooks', avatar: 'AJ', niche: 'Food & Cooking', platform: 'TikTok', followers: 213000, engagementRate: 8.1, avgViews: 180000, location: 'Atlanta, USA', language: 'English', pricePerPost: 2400, rating: 4.9, pastCollabs: 9, bio: 'Viral recipe creator with 8.1% engagement. Every sponsored post sells out.', tags: ['food', 'recipes', 'cooking'], verified: true },
  { id: 'cr-009', name: 'Lena Müller', handle: '@lenatech', avatar: 'LM', niche: 'Tech & Gadgets', platform: 'YouTube', followers: 128000, engagementRate: 3.5, avgViews: 82000, location: 'Berlin, Germany', language: 'German, English', pricePerPost: 2800, rating: 4.4, pastCollabs: 11, bio: 'Tech reviewer known for brutally honest, in-depth product analysis.', tags: ['tech', 'gadgets', 'reviews'], verified: true },
  { id: 'cr-010', name: 'Raj Patel', handle: '@rajfinance', avatar: 'RP', niche: 'Finance & Investing', platform: 'YouTube', followers: 74500, engagementRate: 4.2, avgViews: 52000, location: 'London, UK', language: 'English', pricePerPost: 2100, rating: 4.5, pastCollabs: 6, bio: 'Chartered accountant making personal finance accessible to millennials.', tags: ['finance', 'investing', 'money'], verified: false },
  { id: 'cr-011', name: 'Zara Ahmed', handle: '@zarafashion', avatar: 'ZA', niche: 'Fashion & Style', platform: 'Instagram', followers: 195000, engagementRate: 3.2, avgViews: 130000, location: 'Dubai, UAE', language: 'Arabic, English', pricePerPost: 3500, rating: 4.3, pastCollabs: 25, bio: 'Fashion-forward creator with a luxury aesthetic and global audience.', tags: ['fashion', 'luxury', 'style'], verified: true },
  { id: 'cr-012', name: 'Marcus Lee', handle: '@marcusgames', avatar: 'ML', niche: 'Gaming', platform: 'TikTok', followers: 342000, engagementRate: 6.4, avgViews: 280000, location: 'Seoul, South Korea', language: 'Korean, English', pricePerPost: 4200, rating: 4.8, pastCollabs: 16, bio: 'Top gaming creator with massive reach in the 18-28 male demographic.', tags: ['gaming', 'esports', 'tech'], verified: true },
];

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
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500–$1,500', min: 500, max: 1500 },
  { label: '$1,500–$3,000', min: 1500, max: 3000 },
  { label: '$3,000+', min: 3000, max: Infinity },
];

export default function CreatorDiscoveryContent() {
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedFollowers, setSelectedFollowers] = useState(0);
  const [selectedEngagement, setSelectedEngagement] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'followers' | 'engagement' | 'price_low' | 'price_high'>('match');
  const [showFilters, setShowFilters] = useState(true);
  const [invitedCreators, setInvitedCreators] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return creators.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()) || c.niche.toLowerCase().includes(search.toLowerCase());
      const matchNiche = selectedNiche === 'All Niches' || c.niche === selectedNiche;
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
  }, [search, selectedNiche, selectedPlatform, selectedLocation, selectedLanguage, selectedFollowers, selectedEngagement, selectedPrice, sortBy]);

  const handleInvite = (creator: Creator) => {
    setInvitedCreators(prev => new Set(prev).add(creator.id));
    toast.success(`Invite sent to ${creator.name}!`);
  };

  const activeFilterCount = [
    selectedNiche !== 'All Niches',
    selectedPlatform !== 'All Platforms',
    selectedLocation !== 'All Locations',
    selectedLanguage !== 'All Languages',
    selectedFollowers > 0,
    selectedEngagement > 0,
    selectedPrice > 0,
  ].filter(Boolean).length;

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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Creator Discovery</h1>
          <p className="text-slate-500 text-sm mt-1">Find and invite the perfect creators for your campaigns</p>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
          {filtered.length} creators found
        </span>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators by name, handle, or niche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${showFilters ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && <span className="bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700"
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

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-500">Active filters:</span>
          {selectedNiche !== 'All Niches' && <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">{selectedNiche} <button onClick={() => setSelectedNiche('All Niches')}><X size={11} /></button></span>}
          {selectedPlatform !== 'All Platforms' && <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-200">{selectedPlatform} <button onClick={() => setSelectedPlatform('All Platforms')}><X size={11} /></button></span>}
          {selectedLocation !== 'All Locations' && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200"><MapPin size={10} />{selectedLocation} <button onClick={() => setSelectedLocation('All Locations')}><X size={11} /></button></span>}
          {selectedLanguage !== 'All Languages' && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200"><Globe size={10} />{selectedLanguage} <button onClick={() => setSelectedLanguage('All Languages')}><X size={11} /></button></span>}
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-56 flex-shrink-0 space-y-4">
            {/* Platform */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Platform</h3>
              <div className="space-y-1">
                {platforms.map(p => (
                  <button key={p} onClick={() => setSelectedPlatform(p)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedPlatform === p ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                ))}
              </div>
            </div>

            {/* Niche */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Niche</h3>
              <div className="space-y-1">
                {niches.map(n => (
                  <button key={n} onClick={() => setSelectedNiche(n)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedNiche === n ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{n}</button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={12} />Locality</h3>
              <div className="space-y-1">
                {locations.map(l => (
                  <button key={l} onClick={() => setSelectedLocation(l)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedLocation === l ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Globe size={12} />Language</h3>
              <div className="space-y-1">
                {languages.map(l => (
                  <button key={l} onClick={() => setSelectedLanguage(l)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedLanguage === l ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Followers */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users size={12} />Followers</h3>
              <div className="space-y-1">
                {followerRanges.map((r, i) => (
                  <button key={i} onClick={() => setSelectedFollowers(i)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedFollowers === i ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><TrendingUp size={12} />Engagement Rate</h3>
              <div className="space-y-1">
                {engagementRanges.map((r, i) => (
                  <button key={i} onClick={() => setSelectedEngagement(i)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedEngagement === i ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><DollarSign size={12} />Price per Post</h3>
              <div className="space-y-1">
                {priceRanges.map((r, i) => (
                  <button key={i} onClick={() => setSelectedPrice(i)} className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedPrice === i ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Creator Grid */}
        <div className="flex-1">
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
                          <p className="text-xs font-bold text-violet-700 tabular-nums">${creator.pricePerPost.toLocaleString()}</p>
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
      </div>
    </div>
  );
}
