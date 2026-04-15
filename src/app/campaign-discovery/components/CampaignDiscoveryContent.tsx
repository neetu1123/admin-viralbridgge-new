'use client';
import React, { useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, SlidersHorizontal, Bookmark, BookmarkCheck, Users, Calendar, DollarSign, TrendingUp, ChevronDown, X, Star, CheckCircle } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

import ApplyModal from './ApplyModal';

const platforms = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Pinterest'];
const niches = ['All Niches', 'Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing'];
const budgetRanges = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 – $1,500', min: 500, max: 1500 },
  { label: '$1,500 – $5,000', min: 1500, max: 5000 },
  { label: '$5,000+', min: 5000, max: Infinity },
];

interface Campaign {
  id: string;
  title: string;
  brand: string;
  brandLogo: string;
  platform: string;
  niche: string;
  budget: number;
  budgetPer: string;
  deadline: string;
  applicants: number;
  slots: number;
  description: string;
  deliverables: string[];
  engagementMin: number;
  followersMin: number;
  status: 'active' | 'in_progress';
  featured: boolean;
  applied?: boolean;
}

const campaigns: Campaign[] = [
  { id: 'camp-001', title: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', brandLogo: 'LS', platform: 'Instagram', niche: 'Beauty & Skincare', budget: 1200, budgetPer: 'per post', deadline: '2026-05-01', applicants: 34, slots: 5, description: 'We are launching our new Summer Glow serum and need authentic creators to showcase their skincare routine using our products. Looking for creators with engaged beauty audiences.', deliverables: ['2 Feed Posts', '4 Stories', '1 Reel'], engagementMin: 3.5, followersMin: 15000, status: 'active', featured: true },
  { id: 'camp-002', title: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', brandLogo: 'FP', platform: 'YouTube', niche: 'Fitness & Wellness', budget: 3500, budgetPer: 'per video', deadline: '2026-05-15', applicants: 18, slots: 3, description: 'Document your 30-day fitness transformation using the FitPro app. We want genuine before/after content that motivates viewers to start their journey.', deliverables: ['1 Long-form Video', '2 Shorts', 'App Review'], engagementMin: 4.2, followersMin: 50000, status: 'active', featured: true },
  { id: 'camp-003', title: 'TechDrop Wireless Earbuds Review', brand: 'TechDrop', brandLogo: 'TD', platform: 'YouTube', niche: 'Tech & Gadgets', budget: 800, budgetPer: 'per video', deadline: '2026-04-28', applicants: 52, slots: 8, description: 'Honest, in-depth review of our new ANC wireless earbuds. We value authenticity — share the real pros and cons with your audience.', deliverables: ['1 Unboxing Video', '1 Review Video', 'Community Post'], engagementMin: 2.8, followersMin: 10000, status: 'active', featured: false },
  { id: 'camp-004', title: 'Wanderlust Travel Card Launch', brand: 'NomadPay', brandLogo: 'NP', platform: 'Instagram', niche: 'Travel & Adventure', budget: 2000, budgetPer: 'per creator', deadline: '2026-05-20', applicants: 27, slots: 4, description: 'Show how NomadPay makes international travel seamless — no foreign transaction fees, instant currency conversion. Perfect for travel content creators.', deliverables: ['3 Feed Posts', '6 Stories', 'Link in Bio (30 days)'], engagementMin: 3.0, followersMin: 25000, status: 'active', featured: false },
  { id: 'camp-005', title: 'Harvest Kitchen — Home Chef Series', brand: 'Harvest Kitchen', brandLogo: 'HK', platform: 'TikTok', niche: 'Food & Cooking', budget: 600, budgetPer: 'per video', deadline: '2026-04-30', applicants: 71, slots: 10, description: 'Create fun, quick recipe videos using our premium spice blends. We want to see your creativity in the kitchen — the more personality, the better!', deliverables: ['3 TikTok Videos', '1 Duet/Collab'], engagementMin: 5.0, followersMin: 8000, status: 'active', featured: false },
  { id: 'camp-006', title: 'StyleForward — Fall Collection Drop', brand: 'StyleForward', brandLogo: 'SF', platform: 'Instagram', niche: 'Fashion & Style', budget: 1800, budgetPer: 'per creator', deadline: '2026-05-10', applicants: 45, slots: 6, description: 'Style our new fall collection in your own unique way. We love creators who push fashion boundaries and have a strong personal aesthetic.', deliverables: ['2 Feed Posts', '5 Stories', '1 Reel', 'Bio Link'], engagementMin: 4.0, followersMin: 20000, status: 'active', featured: true },
  { id: 'camp-007', title: 'GreenPath Sustainable Living', brand: 'GreenPath Co.', brandLogo: 'GP', platform: 'LinkedIn', niche: 'Finance & Investing', budget: 950, budgetPer: 'per post', deadline: '2026-05-25', applicants: 9, slots: 2, description: 'Educate your professional audience about sustainable investing and how GreenPath makes ESG portfolios accessible to everyday investors.', deliverables: ['2 LinkedIn Articles', '4 Posts', '1 Newsletter Feature'], engagementMin: 2.5, followersMin: 5000, status: 'active', featured: false },
  { id: 'camp-008', title: 'GameVault Pro Controller Review', brand: 'GameVault', brandLogo: 'GV', platform: 'TikTok', niche: 'Gaming', budget: 450, budgetPer: 'per video', deadline: '2026-04-22', applicants: 88, slots: 12, description: 'Show off our new pro gaming controller in action. Gameplay clips, reaction videos, or review content — all formats welcome. Fast turnaround needed!', deliverables: ['2 TikTok Videos', '1 Stream Mention'], engagementMin: 4.5, followersMin: 5000, status: 'active', featured: false },
  { id: 'camp-009', title: 'MindClear Meditation App', brand: 'MindClear', brandLogo: 'MC', platform: 'Instagram', niche: 'Fitness & Wellness', budget: 750, budgetPer: 'per creator', deadline: '2026-05-08', applicants: 31, slots: 5, description: 'Share your morning routine featuring MindClear\'s guided meditation sessions. Authentic, calming content that resonates with wellness audiences.', deliverables: ['1 Feed Post', '3 Stories', '1 Reel'], engagementMin: 3.8, followersMin: 12000, status: 'active', featured: false },
  { id: 'camp-010', title: 'SnapBook Photo Printing App', brand: 'SnapBook', brandLogo: 'SB', platform: 'Pinterest', niche: 'Travel & Adventure', budget: 400, budgetPer: 'per pin board', deadline: '2026-05-30', applicants: 14, slots: 6, description: 'Create beautiful Pinterest boards showcasing printed travel photos using SnapBook. Perfect for travel and lifestyle creators with Pinterest presence.', deliverables: ['5 Pins', '1 Board', 'App Feature Story'], engagementMin: 2.0, followersMin: 3000, status: 'active', featured: false },
  { id: 'camp-011', title: 'PureBrew Cold Brew Launch', brand: 'PureBrew Coffee', brandLogo: 'PB', platform: 'Instagram', niche: 'Food & Cooking', budget: 550, budgetPer: 'per creator', deadline: '2026-04-25', applicants: 63, slots: 8, description: 'Introduce PureBrew\'s new cold brew concentrate to your foodie audience. Morning routine content, aesthetic flat lays, or recipe videos all work great.', deliverables: ['2 Posts', '4 Stories'], engagementMin: 3.2, followersMin: 8000, status: 'active', featured: false },
  { id: 'camp-012', title: 'VaultX Crypto Wallet Awareness', brand: 'VaultX Finance', brandLogo: 'VX', platform: 'YouTube', niche: 'Finance & Investing', budget: 4200, budgetPer: 'per video', deadline: '2026-05-18', applicants: 22, slots: 3, description: 'Educate your audience about self-custody crypto wallets and why VaultX is the safest option. Deep-dive explainer content preferred.', deliverables: ['1 Explainer Video (15+ min)', '2 Community Posts', 'Description Link'], engagementMin: 3.5, followersMin: 30000, status: 'active', featured: false },
];

export default function CampaignDiscoveryContent() {
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedBudget, setSelectedBudget] = useState(0);
  const [savedCampaigns, setSavedCampaigns] = useState<Set<string>>(new Set(['camp-003', 'camp-006']));
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set(['camp-001']));
  const [applyTarget, setApplyTarget] = useState<Campaign | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'applicants_low'>('newest');

  const filtered = useMemo(() => {
    const budgetRange = budgetRanges[selectedBudget];
    return campaigns.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
      const matchPlatform = selectedPlatform === 'All Platforms' || c.platform === selectedPlatform;
      const matchNiche = selectedNiche === 'All Niches' || c.niche === selectedNiche;
      const matchBudget = c.budget >= budgetRange.min && c.budget <= budgetRange.max;
      return matchSearch && matchPlatform && matchNiche && matchBudget;
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return b.budget - a.budget;
      if (sortBy === 'applicants_low') return a.applicants - b.applicants;
      return 0;
    });
  }, [search, selectedPlatform, selectedNiche, selectedBudget, sortBy]);

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
  ].filter(Boolean) as string[];

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Discovery</h1>
          <p className="text-slate-500 text-sm mt-1">Browse {campaigns.length} active campaigns matching your profile</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
            {filtered.length} results
          </span>
        </div>
      </div>

      {/* Search + sort bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns or brands..."
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
          {activeFilters.length > 0 && <span className="bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
        </button>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700"
          >
            <option value="newest">Newest First</option>
            <option value="budget_high">Highest Budget</option>
            <option value="applicants_low">Fewest Applicants</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
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
              }}>
                <X size={11} />
              </button>
            </span>
          ))}
          <button onClick={() => { setSelectedPlatform('All Platforms'); setSelectedNiche('All Niches'); setSelectedBudget(0); }} className="text-xs text-slate-500 hover:text-slate-700 underline">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        {showFilters && (
          <div className="w-56 flex-shrink-0 space-y-5 animate-slide-in-right">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Platform</h3>
              <div className="space-y-1">
                {platforms.map(p => (
                  <button
                    key={`plat-${p}`}
                    onClick={() => setSelectedPlatform(p)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedPlatform === p ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Niche</h3>
              <div className="space-y-1">
                {niches.map(n => (
                  <button
                    key={`niche-${n}`}
                    onClick={() => setSelectedNiche(n)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedNiche === n ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Budget Range</h3>
              <div className="space-y-1">
                {budgetRanges.map((r, i) => (
                  <button
                    key={`budget-${i}`}
                    onClick={() => setSelectedBudget(i)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${selectedBudget === i ? 'bg-violet-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200">
              <Search size={40} className="text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-semibold mb-1">No campaigns found</h3>
              <p className="text-slate-400 text-sm text-center max-w-xs">Try adjusting your filters or search term to find matching campaigns.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filtered.map(campaign => {
                const isApplied = appliedCampaigns.has(campaign.id);
                const isSaved = savedCampaigns.has(campaign.id);
                const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000);
                const slotsLeft = campaign.slots - Math.floor(campaign.applicants / 5);

                return (
                  <div
                    key={campaign.id}
                    className={`bg-white rounded-xl border shadow-card hover:shadow-card-md transition-all duration-200 flex flex-col ${campaign.featured ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-200'}`}
                  >
                    {campaign.featured && (
                      <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-amber-600">Featured Campaign</span>
                      </div>
                    )}

                    <div className="p-4 flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-700 text-xs font-bold">{campaign.brandLogo}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 leading-tight line-clamp-1">{campaign.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{campaign.brand}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSave(campaign.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                          title={isSaved ? 'Remove from saved' : 'Save campaign'}
                        >
                          {isSaved ? <BookmarkCheck size={16} className="text-violet-600" /> : <Bookmark size={16} className="text-slate-400" />}
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <PlatformBadge platform={campaign.platform} />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          {campaign.niche}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{campaign.description}</p>

                      {/* Deliverables */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-600 mb-1.5">Deliverables</p>
                        <div className="flex flex-wrap gap-1">
                          {campaign.deliverables.map(d => (
                            <span key={`del-${campaign.id}-${d}`} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <DollarSign size={11} className="text-emerald-600" />
                            <span className="text-xs font-bold text-slate-800 tabular-nums">${campaign.budget.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-400">{campaign.budgetPer}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Users size={11} className="text-blue-600" />
                            <span className="text-xs font-bold text-slate-800 tabular-nums">{campaign.applicants}</span>
                          </div>
                          <p className="text-xs text-slate-400">applicants</p>
                        </div>
                        <div className={`rounded-lg p-2 text-center ${daysLeft <= 7 ? 'bg-red-50' : 'bg-slate-50'}`}>
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Calendar size={11} className={daysLeft <= 7 ? 'text-red-600' : 'text-slate-500'} />
                            <span className={`text-xs font-bold tabular-nums ${daysLeft <= 7 ? 'text-red-700' : 'text-slate-800'}`}>{daysLeft}d</span>
                          </div>
                          <p className="text-xs text-slate-400">left</p>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp size={11} />
                          Min. {campaign.engagementMin}% engagement
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {(campaign.followersMin / 1000).toFixed(0)}K+ followers
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                          {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left` : <span className="text-orange-600 font-medium">Almost full</span>}
                        </span>
                        {isApplied ? (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle size={13} />
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => setApplyTarget(campaign)}
                            className="bg-violet-600 hover:bg-violet-700 active:scale-[0.97] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-150"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Apply modal */}
      {applyTarget && (
        <ApplyModal
          campaign={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={() => handleApplySuccess(applyTarget.id)}
        />
      )}
    </div>
  );
}