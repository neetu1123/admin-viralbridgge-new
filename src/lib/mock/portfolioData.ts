export type PortfolioPlatform = 'Instagram' | 'YouTube' | 'LinkedIn' | 'Facebook' | 'TikTok';

export interface CreatorPortfolioItem {
  id: string;
  type: 'reel' | 'post' | 'video' | 'case-study' | 'image';
  thumbnail: string;
  platform: PortfolioPlatform;
  campaignName: string;
  brandName: string;
  views: string;
  likes: string;
  comments: string;
  publishDate: string;
  featured?: boolean;
  previewUrl?: string;
}

export interface BrandPreviousCampaign {
  id: string;
  banner: string;
  name: string;
  industry: string;
  budget: string;
  creatorCount: number;
  platforms: PortfolioPlatform[];
  status: 'Completed' | 'Active' | 'Paused';
  thumbnails: string[];
  featured?: boolean;
}

export const MOCK_CREATOR_PORTFOLIO: CreatorPortfolioItem[] = [
  {
    id: 'cp1',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=600&h=800&fit=crop',
    platform: 'Instagram',
    campaignName: 'Summer Glow Launch',
    brandName: 'NovaSpark Beauty',
    views: '128K',
    likes: '9.4K',
    comments: '312',
    publishDate: '2026-03-12',
    featured: true,
  },
  {
    id: 'cp2',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7eba0?w=600&h=600&fit=crop',
    platform: 'YouTube',
    campaignName: 'Tech Unboxing Series',
    brandName: 'Pulse Gadgets',
    views: '542K',
    likes: '18.2K',
    comments: '891',
    publishDate: '2026-02-28',
    featured: true,
  },
  {
    id: 'cp3',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop',
    platform: 'Instagram',
    campaignName: 'FitLife Protein Push',
    brandName: 'FitLife Co.',
    views: '86K',
    likes: '6.1K',
    comments: '204',
    publishDate: '2026-01-20',
  },
  {
    id: 'cp4',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=900&fit=crop',
    platform: 'TikTok',
    campaignName: 'Streetwear Drop',
    brandName: 'Urban Thread',
    views: '1.2M',
    likes: '94K',
    comments: '2.1K',
    publishDate: '2025-12-05',
    featured: true,
  },
  {
    id: 'cp5',
    type: 'case-study',
    thumbnail: 'https://images.unsplash.com/photo-1556745750-6826fef3a956?w=600&h=500&fit=crop',
    platform: 'LinkedIn',
    campaignName: 'B2B SaaS Awareness',
    brandName: 'CloudStack',
    views: '24K',
    likes: '1.8K',
    comments: '96',
    publishDate: '2025-11-18',
  },
  {
    id: 'cp6',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0f791?w=600&h=800&fit=crop',
    platform: 'Facebook',
    campaignName: 'Holiday Collection',
    brandName: 'Luxe Mode',
    views: '45K',
    likes: '3.2K',
    comments: '118',
    publishDate: '2025-10-30',
  },
];

export const MOCK_BRAND_CAMPAIGNS: BrandPreviousCampaign[] = [
  {
    id: 'bc1',
    banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&h=400&fit=crop',
    name: 'Summer Glow Skincare Launch',
    industry: 'Beauty & Skincare',
    budget: '$12,500',
    creatorCount: 8,
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    status: 'Completed',
    thumbnails: [
      'https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0f791?w=300&h=300&fit=crop',
    ],
    featured: true,
  },
  {
    id: 'bc2',
    banner: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=400&fit=crop',
    name: 'Back-to-School Tech Bundle',
    industry: 'Technology',
    budget: '$8,200',
    creatorCount: 5,
    platforms: ['YouTube', 'Instagram'],
    status: 'Active',
    thumbnails: [
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7eba0?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556745750-6826fef3a956?w=300&h=300&fit=crop',
    ],
    featured: true,
  },
  {
    id: 'bc3',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=400&fit=crop',
    name: 'Wellness Reset Challenge',
    industry: 'Fitness & Wellness',
    budget: '$6,000',
    creatorCount: 6,
    platforms: ['Instagram', 'TikTok', 'Facebook'],
    status: 'Completed',
    thumbnails: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    ],
  },
];

export const PORTFOLIO_PLATFORMS: PortfolioPlatform[] = ['Instagram', 'YouTube', 'LinkedIn', 'Facebook', 'TikTok'];
