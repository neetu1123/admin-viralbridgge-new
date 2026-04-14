'use client';

import React, { useState, useMemo } from 'react';
import CampaignFilterSidebar from './CampaignFilterSidebar';
import CampaignGrid from './CampaignGrid';
import { SlidersHorizontal, Search } from 'lucide-react';

export interface CampaignFilters {
  search: string;
  budgetMin: number;
  budgetMax: number;
  platforms: string[];
  categories: string[];
  deadline: string;
  sortBy: string;
}

const DEFAULT_FILTERS: CampaignFilters = {
  search: '',
  budgetMin: 0,
  budgetMax: 50000,
  platforms: [],
  categories: [],
  deadline: '',
  sortBy: 'newest',
};

export default function CampaignsExploreClient() {
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateFilter = <K extends keyof CampaignFilters>(key: K, value: CampaignFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.platforms.length) count++;
    if (filters.categories.length) count++;
    if (filters.budgetMin > 0 || filters.budgetMax < 50000) count++;
    if (filters.deadline) count++;
    return count;
  }, [filters]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <span className="inline-block text-[#7B2FF7] font-semibold text-sm uppercase tracking-widest mb-2 font-display">
          Campaigns
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-800 text-3xl lg:text-4xl text-[#1F1F2E] tracking-tight">
              Explore Brand Campaigns
            </h1>
            <p className="text-[#6B6B8A] mt-2 text-base">
              Find paid collaboration opportunities that match your niche and audience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0B4]" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1F1F2E] placeholder-[#9AA0B4] focus:outline-none focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 w-56 transition-all"
              />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7] transition-colors"
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
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <CampaignFilterSidebar filters={filters} updateFilter={updateFilter} onReset={resetFilters} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-700 text-[#1F1F2E] text-base">Filters</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-[#9AA0B4] hover:text-[#1F1F2E] transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <CampaignFilterSidebar filters={filters} updateFilter={updateFilter} onReset={resetFilters} />
              </div>
            </div>
          </div>
        )}

        {/* Campaign grid */}
        <div className="flex-1 min-w-0">
          <CampaignGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}
