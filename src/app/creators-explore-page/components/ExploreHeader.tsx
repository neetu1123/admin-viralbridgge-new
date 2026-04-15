'use client';

import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { CreatorFilters } from './CreatorsExploreClient';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'followers_desc', label: 'Most Followers' },
  { value: 'engagement_desc', label: 'Highest Engagement' },
  { value: 'rate_asc', label: 'Lowest Rate' },
  { value: 'rate_desc', label: 'Highest Rate' },
  { value: 'deals_desc', label: 'Most Deals Done' },
];

interface ExploreHeaderProps {
  filters: CreatorFilters;
  updateFilter: <K extends keyof CreatorFilters>(key: K, value: CreatorFilters[K]) => void;
  activeFilterCount: number;
  onOpenMobileSidebar: () => void;
}

export default function ExploreHeader({ filters, updateFilter, activeFilterCount, onOpenMobileSidebar }: ExploreHeaderProps) {
  return (
    <div className="mb-2">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-display font-800 text-3xl text-[#1F1F2E] tracking-tight">Discover Creators</h1>
        <p className="text-[#6B6B8A] text-base mt-1.5">
          Browse 52,000+ verified creators across every niche and platform
        </p>
      </div>

      {/* Search + controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA0B4]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by name, handle, niche or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 cursor-pointer min-w-[180px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`sort-₹{opt.value}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0B4] pointer-events-none" />
        </div>

        {/* Mobile filter button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm font-medium hover:border-[#7B2FF7] hover:text-[#7B2FF7] transition-all duration-150"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#7B2FF7] text-white text-[10px] font-700 font-display flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}