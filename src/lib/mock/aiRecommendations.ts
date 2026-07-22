export type AiRecommendationFilter = 'all' | 'trending' | 'recent' | 'premium' | 'verified';

export interface AiCreatorRecommendation {
  id: string;
  name: string;
  avatar: string;
  category: string;
  platform: string;
  followers: string;
  engagementRate: string;
  location: string;
  languages: string[];
  matchScore: number;
  reason: string;
  verified: boolean;
  premium: boolean;
  trending?: boolean;
  recentlyActive?: boolean;
}

export const AI_RECOMMENDATION_FILTERS: { id: AiRecommendationFilter; label: string }[] = [
  { id: 'all', label: 'All Recommendations' },
  { id: 'trending', label: 'Trending' },
  { id: 'recent', label: 'Recently Active' },
  { id: 'premium', label: 'Premium Creators' },
  { id: 'verified', label: 'Verified Creators' },
];

export const MOCK_AI_RECOMMENDATIONS: AiCreatorRecommendation[] = [
  {
    id: 'r1',
    name: 'Sofia Martinez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    category: 'Fashion & Style',
    platform: 'Instagram',
    followers: '482K',
    engagementRate: '5.8%',
    location: 'Los Angeles, USA',
    languages: ['English', 'Spanish'],
    matchScore: 96,
    reason: 'High engagement with Fashion campaigns.',
    verified: true,
    premium: true,
    trending: true,
    recentlyActive: true,
  },
  {
    id: 'r2',
    name: 'Priya Nair',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    category: 'Beauty & Skincare',
    platform: 'YouTube',
    followers: '921K',
    engagementRate: '4.2%',
    location: 'Mumbai, India',
    languages: ['English', 'Hindi'],
    matchScore: 93,
    reason: 'Strong conversion on skincare product launches.',
    verified: true,
    premium: false,
    recentlyActive: true,
  },
  {
    id: 'r3',
    name: 'James Okoro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    category: 'Tech & Gadgets',
    platform: 'YouTube',
    followers: '1.2M',
    engagementRate: '3.9%',
    location: 'London, UK',
    languages: ['English'],
    matchScore: 91,
    reason: 'Excellent reach for tech unboxing campaigns.',
    verified: true,
    premium: true,
    trending: true,
  },
  {
    id: 'r4',
    name: 'Mei-Lin Chen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    category: 'Food & Cooking',
    platform: 'TikTok',
    followers: '328K',
    engagementRate: '7.1%',
    location: 'Singapore',
    languages: ['English', 'Mandarin'],
    matchScore: 89,
    reason: 'Viral short-form content for F&B brands.',
    verified: false,
    premium: false,
    recentlyActive: true,
  },
  {
    id: 'r5',
    name: 'Aisha Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    category: 'Fitness & Wellness',
    platform: 'Instagram',
    followers: '215K',
    engagementRate: '6.4%',
    location: 'Lagos, Nigeria',
    languages: ['English'],
    matchScore: 88,
    reason: 'Authentic wellness storytelling with high trust.',
    verified: true,
    premium: false,
  },
  {
    id: 'r6',
    name: 'Daniela Rossi',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
    category: 'Travel & Adventure',
    platform: 'Instagram',
    followers: '156K',
    engagementRate: '4.9%',
    location: 'Barcelona, Spain',
    languages: ['English', 'Spanish', 'French'],
    matchScore: 85,
    reason: 'Premium travel content with luxury brand appeal.',
    verified: true,
    premium: true,
    trending: true,
  },
];
