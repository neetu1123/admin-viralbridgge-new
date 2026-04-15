'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, Users, ArrowRight } from 'lucide-react';
import type { CampaignFilters } from './CampaignsExploreClient';

const ALL_CAMPAIGNS = [
  {
    id: 'c-001',
    brand: 'Glossier',
    brandInitial: 'G',
    brandColor: '#F357A8',
    brandBg: '#FFF0F6',
    title: 'Summer Skin Routine Launch',
    budgetMin: 2000,
    budgetMax: 5000,
    budgetLabel: '₹2,000 – ₹5,000',
    platform: 'Instagram',
    category: 'Beauty & Skincare',
    deadlineDays: 14,
    deadlineLabel: 'Apr 28, 2026',
    deliverables: '3 Reels + 5 Stories',
    applicants: 84,
    status: 'Hot',
    statusColor: '#F357A8',
    statusBg: '#FFF0F6',
  },
  {
    id: 'c-002',
    brand: 'Headspace',
    brandInitial: 'H',
    brandColor: '#7B2FF7',
    brandBg: '#EFEAFF',
    title: 'Mindfulness for Busy Professionals',
    budgetMin: 1500,
    budgetMax: 3000,
    budgetLabel: '₹1,500 – ₹3,000',
    platform: 'YouTube',
    category: 'Wellness',
    deadlineDays: 21,
    deadlineLabel: 'May 5, 2026',
    deliverables: '1 Dedicated Video + 2 Shorts',
    applicants: 41,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
  {
    id: 'c-003',
    brand: 'Allbirds',
    brandInitial: 'A',
    brandColor: '#F9A826',
    brandBg: '#FFF8EC',
    title: 'Sustainable Fashion Week Content',
    budgetMin: 3500,
    budgetMax: 7000,
    budgetLabel: '₹3,500 – ₹7,000',
    platform: 'TikTok',
    category: 'Fashion & Style',
    deadlineDays: 8,
    deadlineLabel: 'Apr 22, 2026',
    deliverables: '4 TikTok Videos + 1 Stitch',
    applicants: 127,
    status: 'Closing Soon',
    statusColor: '#F9A826',
    statusBg: '#FFF8EC',
  },
  {
    id: 'c-004',
    brand: 'Athletic Greens',
    brandInitial: 'AG',
    brandColor: '#22C55E',
    brandBg: '#F0FDF4',
    title: 'Morning Routine Integration',
    budgetMin: 800,
    budgetMax: 2200,
    budgetLabel: '₹800 – ₹2,200',
    platform: 'YouTube',
    category: 'Fitness & Health',
    deadlineDays: 28,
    deadlineLabel: 'May 12, 2026',
    deliverables: '1 Integration + 2 Shorts',
    applicants: 63,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
  {
    id: 'c-005',
    brand: 'Oatly',
    brandInitial: 'O',
    brandColor: '#F9A826',
    brandBg: '#FFF8EC',
    title: 'Plant-Based Lifestyle Series',
    budgetMin: 1200,
    budgetMax: 2800,
    budgetLabel: '₹1,200 – ₹2,800',
    platform: 'Instagram',
    category: 'Food & Cooking',
    deadlineDays: 34,
    deadlineLabel: 'May 18, 2026',
    deliverables: '2 Reels + 1 Carousel Post',
    applicants: 38,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
  {
    id: 'c-006',
    brand: 'Duolingo',
    brandInitial: 'D',
    brandColor: '#7B2FF7',
    brandBg: '#EFEAFF',
    title: 'Language Learning Challenge',
    budgetMin: 500,
    budgetMax: 1500,
    budgetLabel: '₹500 – ₹1,500',
    platform: 'TikTok',
    category: 'Education',
    deadlineDays: 41,
    deadlineLabel: 'May 25, 2026',
    deliverables: '5 Short-form Videos',
    applicants: 209,
    status: 'Hot',
    statusColor: '#F357A8',
    statusBg: '#FFF0F6',
  },
  {
    id: 'c-007',
    brand: 'Notion',
    brandInitial: 'N',
    brandColor: '#1F1F2E',
    brandBg: '#F2F3F7',
    title: 'Productivity Workflow Showcase',
    budgetMin: 2500,
    budgetMax: 6000,
    budgetLabel: '₹2,500 – ₹6,000',
    platform: 'YouTube',
    category: 'Tech & Gadgets',
    deadlineDays: 45,
    deadlineLabel: 'May 30, 2026',
    deliverables: '1 Tutorial Video + 3 Clips',
    applicants: 92,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
  {
    id: 'c-008',
    brand: 'Airbnb',
    brandInitial: 'AB',
    brandColor: '#F357A8',
    brandBg: '#FFF0F6',
    title: 'Summer Travel Experiences',
    budgetMin: 8000,
    budgetMax: 20000,
    budgetLabel: '₹8,000 – ₹20,000',
    platform: 'Instagram',
    category: 'Travel & Adventure',
    deadlineDays: 55,
    deadlineLabel: 'Jun 8, 2026',
    deliverables: '6 Posts + 10 Stories + 2 Reels',
    applicants: 156,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
  {
    id: 'c-009',
    brand: 'Razer',
    brandInitial: 'R',
    brandColor: '#22C55E',
    brandBg: '#F0FDF4',
    title: 'Gaming Peripheral Launch',
    budgetMin: 3000,
    budgetMax: 8000,
    budgetLabel: '₹3,000 – ₹8,000',
    platform: 'YouTube',
    category: 'Gaming',
    deadlineDays: 18,
    deadlineLabel: 'May 2, 2026',
    deliverables: '1 Review Video + 2 Shorts',
    applicants: 74,
    status: 'Open',
    statusColor: '#7B2FF7',
    statusBg: '#EFEAFF',
  },
];

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, { text: string; bg: string }> = {
    Instagram: { text: '#F357A8', bg: '#FFF0F6' },
    TikTok: { text: '#1F1F2E', bg: '#F2F3F7' },
    YouTube: { text: '#EF4444', bg: '#FEF2F2' },
    'Twitter/X': { text: '#6B6B8A', bg: '#F2F3F7' },
    Pinterest: { text: '#EF4444', bg: '#FEF2F2' },
    LinkedIn: { text: '#2563EB', bg: '#EFF6FF' },
  };
  const style = colors[platform] || { text: '#6B6B8A', bg: '#F2F3F7' };
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: style.text, backgroundColor: style.bg }}
    >
      {platform}
    </span>
  );
}

interface CampaignGridProps {
  filters: CampaignFilters;
}

export default function CampaignGrid({ filters }: CampaignGridProps) {
  const filtered = useMemo(() => {
    return ALL_CAMPAIGNS.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false;
      }
      if (filters.platforms.length && !filters.platforms.includes(c.platform)) return false;
      if (filters.categories.length && !filters.categories.includes(c.category)) return false;
      if (c.budgetMax < filters.budgetMin || c.budgetMin > filters.budgetMax) return false;
      if (filters.deadline) {
        const days = parseInt(filters.deadline);
        if (c.deadlineDays > days) return false;
      }
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'budget_high') return b.budgetMax - a.budgetMax;
      if (filters.sortBy === 'budget_low') return a.budgetMin - b.budgetMin;
      if (filters.sortBy === 'deadline') return a.deadlineDays - b.deadlineDays;
      if (filters.sortBy === 'popular') return b.applicants - a.applicants;
      return 0;
    });
  }, [filtered, filters.sortBy]);

  return (
    <div>
      {/* Sort + count bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#6B6B8A]">
          <span className="font-semibold text-[#1F1F2E]">{sorted.length}</span> campaigns found
        </p>
        <select
          value={filters.sortBy}
          onChange={(e) => filters.sortBy !== e.target.value && (filters.sortBy = e.target.value)}
          className="text-sm border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#6B6B8A] bg-white focus:outline-none focus:border-[#7B2FF7] cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="budget_high">Highest Budget</option>
          <option value="budget_low">Lowest Budget</option>
          <option value="deadline">Deadline Soon</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEAFF] flex items-center justify-center mb-4">
            <DollarSign size={28} className="text-[#7B2FF7]" />
          </div>
          <h3 className="font-display font-700 text-[#1F1F2E] text-lg mb-2">No campaigns found</h3>
          <p className="text-[#6B6B8A] text-sm max-w-xs">Try adjusting your filters to discover more brand opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((campaign) => (
            <div
              key={campaign.id}
              className="group bg-white rounded-2xl border border-[#E5E7EB] shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 p-5 flex flex-col gap-4"
            >
              {/* Brand + Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-700 text-sm flex-shrink-0"
                    style={{ color: campaign.brandColor, backgroundColor: campaign.brandBg }}
                  >
                    {campaign.brandInitial}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wide">{campaign.brand}</p>
                    <h3 className="font-display font-700 text-[#1F1F2E] text-sm leading-snug mt-0.5">{campaign.title}</h3>
                  </div>
                </div>
                <span
                  className="text-[10px] font-700 font-display px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ color: campaign.statusColor, backgroundColor: campaign.statusBg }}
                >
                  {campaign.status}
                </span>
              </div>

              {/* Platform + Category */}
              <div className="flex flex-wrap gap-2">
                <PlatformBadge platform={campaign.platform} />
                <span className="text-xs font-medium text-[#6B6B8A] bg-[#F2F3F7] px-2.5 py-1 rounded-full">
                  {campaign.category}
                </span>
              </div>

              {/* Deliverables */}
              <div className="bg-[#F8F7FC] rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-[#9AA0B4] uppercase tracking-wide mb-1">Deliverables</p>
                <p className="text-sm text-[#6B6B8A]">{campaign.deliverables}</p>
              </div>

              {/* Budget + Deadline + Applicants */}
              <div className="flex items-center gap-3 text-xs text-[#9AA0B4]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1F1F2E] tabular-nums">{campaign.budgetLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>{campaign.deadlineLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#9AA0B4]">
                <Users size={12} />
                <span><span className="tabular-nums font-medium text-[#6B6B8A]">{campaign.applicants}</span> creators applied</span>
              </div>

              {/* CTA */}
              <Link
                href="/sign-up-login-screen"
                className="mt-auto w-full text-center py-2.5 rounded-xl border border-[#7B2FF7] text-[#7B2FF7] text-sm font-semibold hover:bg-[#EFEAFF] transition-colors duration-150 group-hover:bg-[#7B2FF7] group-hover:text-white flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
