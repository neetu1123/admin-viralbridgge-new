'use client';

import React, { useMemo, useState } from 'react';
import AppImage from '@/src/components/ui/AppImage';
import { TrendingUp, Star, MessageCircle, Heart, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

import { toast } from 'sonner';
import type { CreatorFilters } from './CreatorsExploreClient';

interface Creator {
  id: string;
  name: string;
  handle: string;
  niche: string;
  platform: string;
  followers: number;
  followersDisplay: string;
  engagement: number;
  engagementDisplay: string;
  avgRate: number;
  avgRateDisplay: string;
  responseRate: number;
  completedDeals: number;
  rating: number;
  avatar: string;
  alt: string;
  verified: boolean;
  nicheBg: string;
  nicheColor: string;
  platformColor: string;
  bio: string;
  tags: string[];
}

const ALL_CREATORS: Creator[] = [
{
  id: 'creator-explore-001',
  name: 'Sofia Chen',
  handle: '@sofiabeauty',
  niche: 'Beauty & Skincare',
  platform: 'Instagram',
  followers: 284000,
  followersDisplay: '284K',
  engagement: 6.8,
  engagementDisplay: '6.8%',
  avgRate: 1800,
  avgRateDisplay: '$1,800/post',
  responseRate: 96,
  completedDeals: 42,
  rating: 4.9,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1043799f0-1772896429674.png",
  alt: 'Young Asian woman with long dark hair and bright smile in soft natural lighting',
  verified: true,
  nicheBg: '#FFF0F6',
  nicheColor: '#F357A8',
  platformColor: '#E1306C',
  bio: 'Authentic beauty content focused on sustainable skincare and Gen Z routines.',
  tags: ['Skincare', 'Makeup', 'Sustainable']
},
{
  id: 'creator-explore-002',
  name: 'Marcus Reid',
  handle: '@marcusfitness',
  niche: 'Fitness & Health',
  platform: 'YouTube',
  followers: 512000,
  followersDisplay: '512K',
  engagement: 4.2,
  engagementDisplay: '4.2%',
  avgRate: 3200,
  avgRateDisplay: '$3,200/video',
  responseRate: 88,
  completedDeals: 67,
  rating: 4.8,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1cce18851-1772227416987.png",
  alt: 'Athletic Black man with short hair wearing white t-shirt in gym setting',
  verified: true,
  nicheBg: '#EFEAFF',
  nicheColor: '#7B2FF7',
  platformColor: '#FF0000',
  bio: 'Fitness educator helping 500K+ subscribers build sustainable workout habits.',
  tags: ['Workout', 'Nutrition', 'Mindset']
},
{
  id: 'creator-explore-003',
  name: 'Priya Sharma',
  handle: '@priyacooks',
  niche: 'Food & Cooking',
  platform: 'TikTok',
  followers: 198000,
  followersDisplay: '198K',
  engagement: 8.1,
  engagementDisplay: '8.1%',
  avgRate: 1200,
  avgRateDisplay: '$1,200/post',
  responseRate: 99,
  completedDeals: 28,
  rating: 5.0,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12ea42ac5-1772258592389.png",
  alt: 'Indian woman with bright smile and curly hair in warm-toned kitchen setting',
  verified: true,
  nicheBg: '#FFF8EC',
  nicheColor: '#F9A826',
  platformColor: '#1F1F2E',
  bio: 'Quick, healthy recipes that make home cooking accessible for busy millennials.',
  tags: ['Recipes', 'Healthy', 'Quick Meals']
},
{
  id: 'creator-explore-004',
  name: 'Liam Torres',
  handle: '@liamtechreviews',
  niche: 'Tech & Gadgets',
  platform: 'YouTube',
  followers: 841000,
  followersDisplay: '841K',
  engagement: 3.6,
  engagementDisplay: '3.6%',
  avgRate: 4500,
  avgRateDisplay: '$4,500/video',
  responseRate: 82,
  completedDeals: 91,
  rating: 4.7,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17e162e7d-1763293508256.png",
  alt: 'Hispanic man with glasses and friendly smile in casual tech office setting',
  verified: true,
  nicheBg: '#F0F8FF',
  nicheColor: '#1DA1F2',
  platformColor: '#FF0000',
  bio: 'Unbiased tech reviews that help everyday people make smarter buying decisions.',
  tags: ['Reviews', 'Gadgets', 'Smartphones']
},
{
  id: 'creator-explore-005',
  name: 'Aisha Okonkwo',
  handle: '@aishalifestyle',
  niche: 'Lifestyle',
  platform: 'Instagram',
  followers: 376000,
  followersDisplay: '376K',
  engagement: 5.9,
  engagementDisplay: '5.9%',
  avgRate: 2400,
  avgRateDisplay: '$2,400/post',
  responseRate: 94,
  completedDeals: 55,
  rating: 4.9,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1703231c0-1765278179841.png",
  alt: 'Nigerian woman with natural hair and warm smile wearing colorful outfit',
  verified: true,
  nicheBg: '#F0FFF4',
  nicheColor: '#22C55E',
  platformColor: '#E1306C',
  bio: 'Celebrating African culture through fashion, food, and everyday lifestyle content.',
  tags: ['Fashion', 'Culture', 'Self-Care']
},
{
  id: 'creator-explore-006',
  name: 'Jake Nguyen',
  handle: '@jakegames',
  niche: 'Gaming',
  platform: 'TikTok',
  followers: 1200000,
  followersDisplay: '1.2M',
  engagement: 7.4,
  engagementDisplay: '7.4%',
  avgRate: 5800,
  avgRateDisplay: '$5,800/post',
  responseRate: 78,
  completedDeals: 33,
  rating: 4.6,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1882b194b-1763293730336.png",
  alt: 'Young Vietnamese man with headphones around neck smiling in gaming setup',
  verified: true,
  nicheBg: '#EFEAFF',
  nicheColor: '#7B2FF7',
  platformColor: '#1F1F2E',
  bio: 'Viral gaming moments and honest game reviews for the next generation of players.',
  tags: ['FPS', 'RPG', 'Mobile Gaming']
},
{
  id: 'creator-explore-007',
  name: 'Elena Russo',
  handle: '@elenatravel',
  niche: 'Travel & Adventure',
  platform: 'Instagram',
  followers: 623000,
  followersDisplay: '623K',
  engagement: 4.8,
  engagementDisplay: '4.8%',
  avgRate: 3800,
  avgRateDisplay: '$3,800/post',
  responseRate: 91,
  completedDeals: 48,
  rating: 4.8,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10ca6927d-1772977923048.png",
  alt: 'Italian woman with blonde hair smiling outdoors in European city setting',
  verified: false,
  nicheBg: '#FFF8EC',
  nicheColor: '#F9A826',
  platformColor: '#E1306C',
  bio: 'Solo female traveler documenting hidden gems across Europe, Asia, and Latin America.',
  tags: ['Solo Travel', 'Budget Tips', 'Hidden Gems']
},
{
  id: 'creator-explore-008',
  name: 'Darius Webb',
  handle: '@dariusmindset',
  niche: 'Lifestyle',
  platform: 'YouTube',
  followers: 289000,
  followersDisplay: '289K',
  engagement: 6.2,
  engagementDisplay: '6.2%',
  avgRate: 2100,
  avgRateDisplay: '$2,100/video',
  responseRate: 97,
  completedDeals: 37,
  rating: 4.9,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ef6a4c1c-1772101813406.png",
  alt: 'Black man with calm expression wearing light blue shirt against neutral background',
  verified: true,
  nicheBg: '#F0FFF4',
  nicheColor: '#22C55E',
  platformColor: '#FF0000',
  bio: 'Mindset coaching and productivity systems for ambitious professionals aged 25–40.',
  tags: ['Mindset', 'Productivity', 'Wellness']
},
{
  id: 'creator-explore-009',
  name: 'Camille Dupont',
  handle: '@camillemode',
  niche: 'Fashion & Style',
  platform: 'Instagram',
  followers: 445000,
  followersDisplay: '445K',
  engagement: 5.3,
  engagementDisplay: '5.3%',
  avgRate: 2900,
  avgRateDisplay: '$2,900/post',
  responseRate: 89,
  completedDeals: 61,
  rating: 4.7,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_155421363-1772465849095.png",
  alt: 'French woman with dark hair and elegant style against Paris street background',
  verified: true,
  nicheBg: '#FFF0F6',
  nicheColor: '#F357A8',
  platformColor: '#E1306C',
  bio: 'Parisian fashion with an accessible twist — luxury looks on real budgets.',
  tags: ['Parisian Style', 'OOTD', 'Luxury']
},
{
  id: 'creator-explore-010',
  name: 'Raj Patel',
  handle: '@rajfinance',
  niche: 'Finance',
  platform: 'YouTube',
  followers: 734000,
  followersDisplay: '734K',
  engagement: 3.9,
  engagementDisplay: '3.9%',
  avgRate: 4200,
  avgRateDisplay: '$4,200/video',
  responseRate: 85,
  completedDeals: 44,
  rating: 4.8,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19f0fd5cb-1763295525028.png",
  alt: 'Indian man with professional demeanor in business casual attire against clean background',
  verified: true,
  nicheBg: '#F0FFF4',
  nicheColor: '#22C55E',
  platformColor: '#FF0000',
  bio: 'Making personal finance approachable for millennials — investing, saving, and building wealth.',
  tags: ['Investing', 'Budgeting', 'FIRE']
},
{
  id: 'creator-explore-011',
  name: 'Mia Johansson',
  handle: '@miahome',
  niche: 'Home & Decor',
  platform: 'Pinterest',
  followers: 162000,
  followersDisplay: '162K',
  engagement: 9.4,
  engagementDisplay: '9.4%',
  avgRate: 950,
  avgRateDisplay: '$950/post',
  responseRate: 100,
  completedDeals: 19,
  rating: 5.0,
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ae8c149f-1773079673053.png",
  alt: 'Scandinavian woman with light hair in minimalist home interior setting',
  verified: false,
  nicheBg: '#FFF8EC',
  nicheColor: '#F9A826',
  platformColor: '#E60023',
  bio: 'Minimalist Scandinavian home decor and DIY projects for small-space living.',
  tags: ['Minimalism', 'DIY', 'Scandinavian']
},
{
  id: 'creator-explore-012',
  name: 'Jordan Kim',
  handle: '@jordanpets',
  niche: 'Pets',
  platform: 'TikTok',
  followers: 892000,
  followersDisplay: '892K',
  engagement: 11.2,
  engagementDisplay: '11.2%',
  avgRate: 3600,
  avgRateDisplay: '$3,600/post',
  responseRate: 93,
  completedDeals: 26,
  rating: 4.9,
  avatar: "https://images.unsplash.com/photo-1724828236694-67f52d25968f",
  alt: 'Korean-American person with friendly smile holding small fluffy dog',
  verified: true,
  nicheBg: '#F0F8FF',
  nicheColor: '#1DA1F2',
  platformColor: '#1F1F2E',
  bio: 'Pet care tips, training hacks, and wholesome content for dog and cat parents.',
  tags: ['Dog Care', 'Cat Tips', 'Training']
},
{
  id: 'creator-explore-013',
  name: 'Aaliya Hassan',
  handle: '@aaliyaparents',
  niche: 'Parenting',
  platform: 'Instagram',
  followers: 214000,
  followersDisplay: '214K',
  engagement: 7.6,
  engagementDisplay: '7.6%',
  avgRate: 1500,
  avgRateDisplay: '$1,500/post',
  responseRate: 98,
  completedDeals: 31,
  rating: 4.9,
  avatar: "https://images.unsplash.com/photo-1616254105677-39d969b03326",
  alt: 'Arab woman in hijab with gentle smile holding toddler in bright home setting',
  verified: true,
  nicheBg: '#FFF0F6',
  nicheColor: '#F357A8',
  platformColor: '#E1306C',
  bio: 'Honest parenting content for modern Muslim families — raising kids with intention.',
  tags: ['Muslim Parenting', 'Toddlers', 'Family']
},
{
  id: 'creator-explore-014',
  name: 'Tyler Brooks',
  handle: '@tyleredu',
  niche: 'Education',
  platform: 'YouTube',
  followers: 478000,
  followersDisplay: '478K',
  engagement: 5.1,
  engagementDisplay: '5.1%',
  avgRate: 2800,
  avgRateDisplay: '$2,800/video',
  responseRate: 87,
  completedDeals: 52,
  rating: 4.7,
  avatar: "https://images.unsplash.com/flagged/photo-1559264243-77e7b0942b77",
  alt: 'Young Black man with glasses in academic setting with books in background',
  verified: true,
  nicheBg: '#F0F8FF',
  nicheColor: '#1DA1F2',
  platformColor: '#FF0000',
  bio: 'Simplifying complex topics in science, history, and culture for curious minds.',
  tags: ['Science', 'History', 'Study Tips']
}];


const ITEMS_PER_PAGE = 9;

interface CreatorGridProps {
  filters: CreatorFilters;
}

function platformBadgeStyle(platform: string): {bg: string;color: string;} {
  const map: Record<string, {bg: string;color: string;}> = {
    Instagram: { bg: '#FFF0F6', color: '#E1306C' },
    TikTok: { bg: '#F2F3F7', color: '#1F1F2E' },
    YouTube: { bg: '#FFF5F5', color: '#FF0000' },
    'Twitter/X': { bg: '#F0F8FF', color: '#1DA1F2' },
    Pinterest: { bg: '#FFF5F5', color: '#E60023' },
    LinkedIn: { bg: '#F0F8FF', color: '#0A66C2' }
  };
  return map[platform] || { bg: '#F2F3F7', color: '#6B6B8A' };
}

export default function CreatorGrid({ filters }: CreatorGridProps) {
  const [page, setPage] = useState(1);
  const [savedCreators, setSavedCreators] = useState<Set<string>>(new Set());

  const toggleSave = (creatorId: string, name: string) => {
    setSavedCreators((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
        toast.success(`Removed ${name} from saved creators`);
      } else {
        next.add(creatorId);
        toast.success(`Saved ${name} to your list`);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...ALL_CREATORS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter((c) => filters.categories.includes(c.niche));
    }

    if (filters.platforms.length > 0) {
      result = result.filter((c) => filters.platforms.includes(c.platform));
    }

    result = result.filter(
      (c) => c.followers >= filters.followersMin && c.followers <= filters.followersMax
    );

    if (filters.engagementMin > 0) {
      result = result.filter((c) => c.engagement >= filters.engagementMin);
    }

    if (filters.rateMax < 10000) {
      result = result.filter((c) => c.avgRate <= filters.rateMax);
    }

    // Sort
    switch (filters.sortBy) {
      case 'followers_desc':
        result.sort((a, b) => b.followers - a.followers);
        break;
      case 'engagement_desc':
        result.sort((a, b) => b.engagement - a.engagement);
        break;
      case 'rate_asc':
        result.sort((a, b) => a.avgRate - b.avgRate);
        break;
      case 'rate_desc':
        result.sort((a, b) => b.avgRate - a.avgRate);
        break;
      case 'deals_desc':
        result.sort((a, b) => b.completedDeals - a.completedDeals);
        break;
      default:
        break;
    }

    return result;
  }, [filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#E5E7EB]">
        <div className="w-16 h-16 rounded-2xl bg-[#F2F3F7] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9AA0B4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3 className="font-display font-700 text-[#1F1F2E] text-lg mb-2">No creators match your filters</h3>
        <p className="text-[#6B6B8A] text-sm max-w-xs leading-relaxed">
          Try adjusting your category, platform, or follower range to find more creators.
        </p>
      </div>);

  }

  return (
    <div>
      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[#6B6B8A] text-sm">
          Showing <span className="font-display font-700 text-[#1F1F2E] tabular-nums">{filtered.length}</span> creators
        </p>
        <p className="text-[#9AA0B4] text-xs">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginated.map((creator) => {
          const platformStyle = platformBadgeStyle(creator.platform);
          const isSaved = savedCreators.has(creator.id);

          return (
            <div
              key={creator.id}
              className="group bg-white rounded-2xl border border-[#E5E7EB] shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 overflow-hidden flex flex-col">
              
              {/* Card top — avatar + meta */}
              <div className="p-5 pb-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#F2F3F7] ring-2 ring-[#F8F7FC]">
                      <AppImage
                        src={creator.avatar}
                        alt={creator.alt}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full" />
                      
                    </div>
                    {creator.verified &&
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7B2FF7] flex items-center justify-center ring-2 ring-white">
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    }
                  </div>

                  {/* Name + handle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display font-700 text-[#1F1F2E] text-sm truncate">{creator.name}</h3>
                        <p className="text-[#9AA0B4] text-xs mt-0.5 truncate">{creator.handle}</p>
                      </div>
                      {/* Save button */}
                      <button
                        onClick={() => toggleSave(creator.id, creator.name)}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
                        isSaved ?
                        'bg-[#FFF0F6] text-[#F357A8]' :
                        'text-[#9AA0B4] hover:bg-[#F2F3F7] hover:text-[#6B6B8A]'}`
                        }
                        aria-label={isSaved ? 'Remove from saved' : 'Save creator'}>
                        
                        <Heart size={14} className={isSaved ? 'fill-[#F357A8]' : ''} />
                      </button>
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: creator.nicheColor, backgroundColor: creator.nicheBg }}>
                        
                        {creator.niche}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: platformStyle.color, backgroundColor: platformStyle.bg }}>
                        
                        {creator.platform}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[#6B6B8A] text-xs leading-relaxed mt-3 line-clamp-2">{creator.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {creator.tags.map((tag) =>
                  <span
                    key={`tag-${creator.id}-${tag}`}
                    className="text-[10px] font-medium text-[#9AA0B4] bg-[#F2F3F7] px-2 py-0.5 rounded-full">
                    
                      {tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-0 border-t border-[#F2F3F7]">
                {[
                { label: 'Followers', value: creator.followersDisplay, icon: null, color: '#1F1F2E' },
                {
                  label: 'Engagement',
                  value: creator.engagementDisplay,
                  icon: TrendingUp,
                  color: creator.engagement >= 6 ? '#22C55E' : creator.engagement >= 3 ? '#F9A826' : '#9AA0B4'
                },
                { label: 'Response', value: `${creator.responseRate}%`, icon: MessageCircle, color: '#7B2FF7' },
                { label: 'Deals', value: String(creator.completedDeals), icon: null, color: '#1F1F2E' }].
                map((stat, idx) =>
                <div
                  key={`stat-${creator.id}-${idx}`}
                  className="flex flex-col items-center justify-center py-3 px-1 border-r border-[#F2F3F7] last:border-r-0">
                  
                    {stat.icon && <stat.icon size={11} style={{ color: stat.color }} className="mb-0.5" />}
                    <div
                    className="font-display font-700 text-xs tabular-nums"
                    style={{ color: stat.color }}>
                    
                      {stat.value}
                    </div>
                    <div className="text-[#9AA0B4] text-[9px] mt-0.5 text-center leading-tight">{stat.label}</div>
                  </div>
                )}
              </div>

              {/* Rate + Rating + CTA */}
              <div className="p-4 pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#1F1F2E] font-display font-700 text-sm tabular-nums">{creator.avgRateDisplay}</span>
                    <span className="text-[#9AA0B4] text-xs ml-1">avg.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#F9A826] fill-[#F9A826]" />
                    <span className="font-display font-700 text-sm text-[#1F1F2E] tabular-nums">{creator.rating}</span>
                    <span className="text-[#9AA0B4] text-xs">({creator.completedDeals})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toast.success(`Invite sent to ${creator.name}!`)}
                    className="py-2 rounded-xl text-white text-xs font-display font-700 transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}>
                    
                    Invite to Campaign
                  </button>
                  <button
                    className="py-2 rounded-xl border border-[#E5E7EB] text-[#6B6B8A] text-xs font-medium hover:border-[#7B2FF7] hover:text-[#7B2FF7] hover:bg-[#EFEAFF] transition-all duration-150 flex items-center justify-center gap-1"
                    onClick={() => toast.info(`Opening ${creator.name}'s full profile...`)}>
                    
                    <ExternalLink size={11} />
                    View Profile
                  </button>
                </div>
              </div>
            </div>);

        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 &&
      <div className="mt-10 flex items-center justify-between">
          <p className="text-[#9AA0B4] text-sm tabular-nums">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} creators
          </p>

          <div className="flex items-center gap-1.5">
            <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7] hover:bg-[#EFEAFF] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E5E7EB] disabled:hover:text-[#6B6B8A] disabled:hover:bg-transparent">
            
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            const isNearby = Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === totalPages;

            if (!isNearby) {
              if (pageNum === 2 && page > 3) return <span key={`page-ellipsis-start`} className="text-[#9AA0B4] text-sm px-1">…</span>;
              if (pageNum === totalPages - 1 && page < totalPages - 2) return <span key={`page-ellipsis-end`} className="text-[#9AA0B4] text-sm px-1">…</span>;
              return null;
            }

            return (
              <button
                key={`page-btn-${pageNum}`}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl text-sm font-display font-600 transition-all duration-150 ${
                isActive ?
                'text-white shadow-sm' :
                'border border-[#E5E7EB] text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7] hover:bg-[#EFEAFF]'}`
                }
                style={isActive ? { background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' } : {}}>
                
                  {pageNum}
                </button>);

          })}

            <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7] hover:bg-[#EFEAFF] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E5E7EB] disabled:hover:text-[#6B6B8A] disabled:hover:bg-transparent">
            
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      }
    </div>);

}