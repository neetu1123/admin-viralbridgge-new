'use client';
import React, { useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
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
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 – $1,500', min: 500, max: 1500 },
  { label: '$1,500 – $5,000', min: 1500, max: 5000 },
  { label: '$5,000+', min: 5000, max: Infinity },
];

const followerRequirements = [
  { label: 'Any', min: 0 },
  { label: '5K+', min: 5000 },
  { label: '10K+', min: 10000 },
  { label: '25K+', min: 25000 },
  { label: '50K+', min: 50000 },
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
  locality: string;
  language: string;
  // Enhanced fields
  aiMatchScore: number;
  approvalChance: 'High' | 'Medium' | 'Low';
  matchReason: string;
  earnAmount: number;
  verifiedBrand: boolean;
  escrowProtected: boolean;
  avgPaymentDays: number;
  creatorRating: number;
  totalCreatorsEarned: string;
  previouslySelected: number;
  creatorSatisfaction: number;
  viewingNow: number;
  category: 'recommended' | 'trending' | 'high_budget' | 'easy_approval' | 'new_brand' | 'fast_paying';
  brandSize: string;
  paymentType: string;
}

const campaigns: Campaign[] = [
  { id: 'camp-001', title: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', brandLogo: 'LS', platform: 'Instagram', niche: 'Beauty & Skincare', budget: 1200, budgetPer: 'per post', deadline: '2026-05-01', applicants: 34, slots: 5, description: 'We are launching our new Summer Glow serum and need authentic creators to showcase their skincare routine using our products.', deliverables: ['2 Feed Posts', '4 Stories', '1 Reel'], engagementMin: 3.5, followersMin: 15000, status: 'active', featured: true, locality: 'USA', language: 'English', aiMatchScore: 94, approvalChance: 'High', matchReason: 'Your audience aligns with skincare females 18–30 and your engagement is above campaign average', earnAmount: 3500, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 3, creatorRating: 4.8, totalCreatorsEarned: '₹2.3L', previouslySelected: 18, creatorSatisfaction: 4.8, viewingNow: 5, category: 'recommended', brandSize: 'D2C', paymentType: 'Fixed' },
  { id: 'camp-002', title: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', brandLogo: 'FP', platform: 'YouTube', niche: 'Fitness & Wellness', budget: 3500, budgetPer: 'per video', deadline: '2026-05-15', applicants: 18, slots: 3, description: 'Document your 30-day fitness transformation using the FitPro app.', deliverables: ['1 Long-form Video', '2 Shorts', 'App Review'], engagementMin: 4.2, followersMin: 50000, status: 'active', featured: true, locality: 'Global', language: 'English', aiMatchScore: 88, approvalChance: 'High', matchReason: 'Your reels perform well in fitness niche and brand prefers mid-tier creators', earnAmount: 3500, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 5, creatorRating: 4.6, totalCreatorsEarned: '₹1.8L', previouslySelected: 12, creatorSatisfaction: 4.6, viewingNow: 3, category: 'high_budget', brandSize: 'Enterprise', paymentType: 'Fixed' },
  { id: 'camp-003', title: 'TechDrop Wireless Earbuds Review', brand: 'TechDrop', brandLogo: 'TD', platform: 'YouTube', niche: 'Tech & Gadgets', budget: 800, budgetPer: 'per video', deadline: '2026-04-28', applicants: 52, slots: 8, description: 'Honest, in-depth review of our new ANC wireless earbuds.', deliverables: ['1 Unboxing Video', '1 Review Video', 'Community Post'], engagementMin: 2.8, followersMin: 10000, status: 'active', featured: false, locality: 'Germany', language: 'German', aiMatchScore: 72, approvalChance: 'Medium', matchReason: 'Tech content aligns but audience location may not fully match', earnAmount: 800, verifiedBrand: false, escrowProtected: true, avgPaymentDays: 7, creatorRating: 4.2, totalCreatorsEarned: '₹85K', previouslySelected: 8, creatorSatisfaction: 4.2, viewingNow: 8, category: 'trending', brandSize: 'Startup', paymentType: 'Fixed' },
  { id: 'camp-004', title: 'Wanderlust Travel Card Launch', brand: 'NomadPay', brandLogo: 'NP', platform: 'Instagram', niche: 'Travel & Adventure', budget: 2000, budgetPer: 'per creator', deadline: '2026-05-20', applicants: 27, slots: 4, description: 'Show how NomadPay makes international travel seamless.', deliverables: ['3 Feed Posts', '6 Stories', 'Link in Bio (30 days)'], engagementMin: 3.0, followersMin: 25000, status: 'active', featured: false, locality: 'Spain', language: 'Spanish', aiMatchScore: 81, approvalChance: 'High', matchReason: 'Travel content matches perfectly, brand prefers authentic storytellers', earnAmount: 2000, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 4, creatorRating: 4.7, totalCreatorsEarned: '₹1.2L', previouslySelected: 14, creatorSatisfaction: 4.7, viewingNow: 2, category: 'recommended', brandSize: 'D2C', paymentType: 'Hybrid' },
  { id: 'camp-005', title: 'Harvest Kitchen — Home Chef Series', brand: 'Harvest Kitchen', brandLogo: 'HK', platform: 'TikTok', niche: 'Food & Cooking', budget: 600, budgetPer: 'per video', deadline: '2026-04-30', applicants: 71, slots: 10, description: 'Create fun, quick recipe videos using our premium spice blends.', deliverables: ['3 TikTok Videos', '1 Duet/Collab'], engagementMin: 5.0, followersMin: 8000, status: 'active', featured: false, locality: 'India', language: 'Hindi', aiMatchScore: 91, approvalChance: 'High', matchReason: 'Your food content engagement is 2x above average, high approval likelihood', earnAmount: 1800, verifiedBrand: false, escrowProtected: false, avgPaymentDays: 10, creatorRating: 3.9, totalCreatorsEarned: '₹65K', previouslySelected: 10, creatorSatisfaction: 3.9, viewingNow: 12, category: 'easy_approval', brandSize: 'Startup', paymentType: 'Fixed' },
  { id: 'camp-006', title: 'StyleForward — Fall Collection Drop', brand: 'StyleForward', brandLogo: 'SF', platform: 'Instagram', niche: 'Fashion & Style', budget: 1800, budgetPer: 'per creator', deadline: '2026-05-10', applicants: 45, slots: 6, description: 'Style our new fall collection in your own unique way.', deliverables: ['2 Feed Posts', '5 Stories', '1 Reel', 'Bio Link'], engagementMin: 4.0, followersMin: 20000, status: 'active', featured: true, locality: 'UAE', language: 'Arabic', aiMatchScore: 86, approvalChance: 'Medium', matchReason: 'Fashion niche match strong, brand prefers creators with aesthetic feeds', earnAmount: 1800, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 3, creatorRating: 4.9, totalCreatorsEarned: '₹3.1L', previouslySelected: 25, creatorSatisfaction: 4.9, viewingNow: 7, category: 'trending', brandSize: 'Enterprise', paymentType: 'Fixed' },
  { id: 'camp-007', title: 'GreenPath Sustainable Living', brand: 'GreenPath Co.', brandLogo: 'GP', platform: 'LinkedIn', niche: 'Finance & Investing', budget: 950, budgetPer: 'per post', deadline: '2026-05-25', applicants: 9, slots: 2, description: 'Educate your professional audience about sustainable investing.', deliverables: ['2 LinkedIn Articles', '4 Posts', '1 Newsletter Feature'], engagementMin: 2.5, followersMin: 5000, status: 'active', featured: false, locality: 'UK', language: 'English', aiMatchScore: 65, approvalChance: 'Low', matchReason: 'Niche mismatch — your content is more lifestyle than finance', earnAmount: 950, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 6, creatorRating: 4.4, totalCreatorsEarned: '₹45K', previouslySelected: 2, creatorSatisfaction: 4.4, viewingNow: 1, category: 'new_brand', brandSize: 'Startup', paymentType: 'Affiliate' },
  { id: 'camp-008', title: 'GameVault Pro Controller Review', brand: 'GameVault', brandLogo: 'GV', platform: 'TikTok', niche: 'Gaming', budget: 450, budgetPer: 'per video', deadline: '2026-04-22', applicants: 88, slots: 12, description: 'Show off our new pro gaming controller in action.', deliverables: ['2 TikTok Videos', '1 Stream Mention'], engagementMin: 4.5, followersMin: 5000, status: 'active', featured: false, locality: 'Japan', language: 'Japanese', aiMatchScore: 78, approvalChance: 'High', matchReason: 'Gaming content matches, many slots available — easy to get in', earnAmount: 900, verifiedBrand: false, escrowProtected: false, avgPaymentDays: 14, creatorRating: 3.7, totalCreatorsEarned: '₹38K', previouslySelected: 12, creatorSatisfaction: 3.7, viewingNow: 15, category: 'easy_approval', brandSize: 'Startup', paymentType: 'Fixed' },
  { id: 'camp-009', title: 'MindClear Meditation App', brand: 'MindClear', brandLogo: 'MC', platform: 'Instagram', niche: 'Fitness & Wellness', budget: 750, budgetPer: 'per creator', deadline: '2026-05-08', applicants: 31, slots: 5, description: "Share your morning routine featuring MindClear's guided meditation sessions.", deliverables: ['1 Feed Post', '3 Stories', '1 Reel'], engagementMin: 3.8, followersMin: 12000, status: 'active', featured: false, locality: 'Singapore', language: 'English', aiMatchScore: 83, approvalChance: 'High', matchReason: 'Wellness niche aligns, your audience skews female 25–35 which matches brand target', earnAmount: 750, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 2, creatorRating: 4.8, totalCreatorsEarned: '₹72K', previouslySelected: 5, creatorSatisfaction: 4.8, viewingNow: 4, category: 'fast_paying', brandSize: 'D2C', paymentType: 'Fixed' },
  { id: 'camp-010', title: 'SnapBook Photo Printing App', brand: 'SnapBook', brandLogo: 'SB', platform: 'Pinterest', niche: 'Travel & Adventure', budget: 400, budgetPer: 'per pin board', deadline: '2026-05-30', applicants: 14, slots: 6, description: 'Create beautiful Pinterest boards showcasing printed travel photos.', deliverables: ['5 Pins', '1 Board', 'App Feature Story'], engagementMin: 2.0, followersMin: 3000, status: 'active', featured: false, locality: 'Global', language: 'English', aiMatchScore: 70, approvalChance: 'High', matchReason: 'Low competition, many slots, easy approval for travel creators', earnAmount: 400, verifiedBrand: false, escrowProtected: false, avgPaymentDays: 12, creatorRating: 4.0, totalCreatorsEarned: '₹22K', previouslySelected: 6, creatorSatisfaction: 4.0, viewingNow: 2, category: 'new_brand', brandSize: 'Startup', paymentType: 'Fixed' },
  { id: 'camp-011', title: 'PureBrew Cold Brew Launch', brand: 'PureBrew Coffee', brandLogo: 'PB', platform: 'Instagram', niche: 'Food & Cooking', budget: 550, budgetPer: 'per creator', deadline: '2026-04-25', applicants: 63, slots: 8, description: "Introduce PureBrew's new cold brew concentrate to your foodie audience.", deliverables: ['2 Posts', '4 Stories'], engagementMin: 3.2, followersMin: 8000, status: 'active', featured: false, locality: 'USA', language: 'English', aiMatchScore: 89, approvalChance: 'High', matchReason: 'Food content engagement is strong, brand loves authentic lifestyle creators', earnAmount: 1100, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 3, creatorRating: 4.6, totalCreatorsEarned: '₹1.1L', previouslySelected: 8, creatorSatisfaction: 4.6, viewingNow: 6, category: 'fast_paying', brandSize: 'D2C', paymentType: 'Fixed' },
  { id: 'camp-012', title: 'VaultX Crypto Wallet Awareness', brand: 'VaultX Finance', brandLogo: 'VX', platform: 'YouTube', niche: 'Finance & Investing', budget: 4200, budgetPer: 'per video', deadline: '2026-05-18', applicants: 22, slots: 3, description: 'Educate your audience about self-custody crypto wallets.', deliverables: ['1 Explainer Video (15+ min)', '2 Community Posts', 'Description Link'], engagementMin: 3.5, followersMin: 30000, status: 'active', featured: false, locality: 'UK', language: 'English', aiMatchScore: 76, approvalChance: 'Medium', matchReason: 'Finance niche partial match, high budget opportunity worth applying', earnAmount: 4200, verifiedBrand: true, escrowProtected: true, avgPaymentDays: 5, creatorRating: 4.5, totalCreatorsEarned: '₹2.8L', previouslySelected: 3, creatorSatisfaction: 4.5, viewingNow: 3, category: 'high_budget', brandSize: 'Enterprise', paymentType: 'Fixed' },
];

const recommendedTabs = [
  { id: 'recommended', label: 'Recommended', icon: '⭐' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'high_budget', label: 'High Budget', icon: '💰' },
  { id: 'easy_approval', label: 'Easy Approval', icon: '✅' },
  { id: 'new_brand', label: 'New Brands', icon: '🆕' },
  { id: 'fast_paying', label: 'Fast Paying', icon: '⚡' },
];

export default function CampaignDiscoveryContent() {
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
  const [savedCampaigns, setSavedCampaigns] = useState<Set<string>>(new Set(['camp-003', 'camp-006']));
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set(['camp-001']));
  const [applyTarget, setApplyTarget] = useState<Campaign | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'budget_low' | 'applicants_low' | 'match'>('match');
  const [activeRecommendedTab, setActiveRecommendedTab] = useState('recommended');

  const toggleMultiFilter = (val: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    const budgetRange = budgetRanges[selectedBudget];
    const followerMin = followerRequirements[selectedFollowers].min;
    return campaigns.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
      const matchPlatform = selectedPlatform === 'All Platforms' || c.platform === selectedPlatform;
      const matchNiche = selectedNiche === 'All Niches' || c.niche === selectedNiche;
      const matchBudget = c.budget >= budgetRange.min && c.budget <= budgetRange.max;
      const matchLocality = selectedLocality === 'All Locations' || c.locality === selectedLocality;
      const matchLanguage = selectedLanguage === 'All Languages' || c.language === selectedLanguage;
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
  }, [search, selectedPlatform, selectedNiche, selectedBudget, selectedLocality, selectedLanguage, selectedFollowers, selectedDeliverables, selectedPaymentTypes, selectedBrandSizes, sortBy]);

  const recommendedFiltered = useMemo(() => {
    return campaigns.filter(c => c.category === activeRecommendedTab).sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  }, [activeRecommendedTab]);

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

          {/* AI Match Score */}
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

          {/* Match reason */}
          <p className="text-xs text-slate-500 italic mb-3 leading-relaxed line-clamp-2">"{campaign.matchReason}"</p>

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
                className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97] ${campaign.aiMatchScore >= 90 ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-200' : 'bg-violet-600 hover:bg-violet-700'}`}
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
          <p className="text-slate-500 text-sm mt-1">Browse {campaigns.length} active campaigns — AI-matched to your profile</p>
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
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns or brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilters.length > 0 && <span className="bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFilters.length}</span>}
        </button>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-slate-700"
          >
            <option value="match">Best AI Match</option>
            <option value="newest">Newest First</option>
            <option value="budget_high">Budget: High to Low</option>
            <option value="budget_low">Budget: Low to High</option>
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

      <div className="flex gap-6">
        {/* Advanced Filter sidebar */}
        {showFilters && (
          <div className="w-60 flex-shrink-0 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Platform</h3>
              <div className="space-y-1">
                {platforms.map(p => (
                  <button key={`plat-${p}`} onClick={() => setSelectedPlatform(p)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedPlatform === p ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Niche</h3>
              <div className="space-y-1">
                {niches.map(n => (
                  <button key={`niche-${n}`} onClick={() => setSelectedNiche(n)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedNiche === n ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{n}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={12} />Locality</h3>
              <div className="space-y-1">
                {localities.map(l => (
                  <button key={`loc-${l}`} onClick={() => setSelectedLocality(l)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedLocality === l ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Globe size={12} />Language</h3>
              <div className="space-y-1">
                {languages.map(l => (
                  <button key={`lang-${l}`} onClick={() => setSelectedLanguage(l)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedLanguage === l ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Budget Range</h3>
              <div className="space-y-1">
                {budgetRanges.map((r, i) => (
                  <button key={`budget-${i}`} onClick={() => setSelectedBudget(i)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedBudget === i ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Users size={12} />Followers Required</h3>
              <div className="space-y-1">
                {followerRequirements.map((r, i) => (
                  <button key={`fol-${i}`} onClick={() => setSelectedFollowers(i)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedFollowers === i ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Deliverable Type</h3>
              <div className="space-y-1.5">
                {deliverableTypes.map(d => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedDeliverables.includes(d)} onChange={() => toggleMultiFilter(d, selectedDeliverables, setSelectedDeliverables)} className="w-3.5 h-3.5 rounded accent-violet-600" />
                    <span className="text-sm text-slate-600">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Payment Type</h3>
              <div className="space-y-1.5">
                {paymentTypes.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPaymentTypes.includes(p)} onChange={() => toggleMultiFilter(p, selectedPaymentTypes, setSelectedPaymentTypes)} className="w-3.5 h-3.5 rounded accent-violet-600" />
                    <span className="text-sm text-slate-600">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Brand Size</h3>
              <div className="space-y-1.5">
                {brandSizes.map(b => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedBrandSizes.includes(b)} onChange={() => toggleMultiFilter(b, selectedBrandSizes, setSelectedBrandSizes)} className="w-3.5 h-3.5 rounded accent-violet-600" />
                    <span className="text-sm text-slate-600">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign grid */}
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
      </div>

      {applyTarget && (
        <ApplyModal campaign={applyTarget} onClose={() => setApplyTarget(null)} onSuccess={() => handleApplySuccess(applyTarget.id)} />
      )}
    </div>
  );
}