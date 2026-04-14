'use client';

import React, { useState, useMemo } from 'react';
import FilterSidebar from './FilterSidebar';
import CreatorGrid from './CreatorGrid';
import ExploreHeader from './ExploreHeader';
import ActiveFilterChips from './ActiveFilterChips';

export interface CreatorFilters {
  search: string;
  categories: string[];
  platforms: string[];
  followersMin: number;
  followersMax: number;
  engagementMin: number;
  sortBy: string;
  rateMax: number;
}

const DEFAULT_FILTERS: CreatorFilters = {
  search: '',
  categories: [],
  platforms: [],
  followersMin: 0,
  followersMax: 5000000,
  engagementMin: 0,
  sortBy: 'relevance',
  rateMax: 10000,
};

export default function CreatorsExploreClient() {
  const [filters, setFilters] = useState<CreatorFilters>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateFilter = <K extends keyof CreatorFilters>(key: K, value: CreatorFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length) count++;
    if (filters.platforms.length) count++;
    if (filters.followersMin > 0 || filters.followersMax < 5000000) count++;
    if (filters.engagementMin > 0) count++;
    if (filters.rateMax < 10000) count++;
    return count;
  }, [filters]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
      {/* Page header */}
      <ExploreHeader
        filters={filters}
        updateFilter={updateFilter}
        activeFilterCount={activeFilterCount}
        onOpenMobileSidebar={() => setSidebarOpen(true)}
      />

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <ActiveFilterChips filters={filters} updateFilter={updateFilter} onReset={resetFilters} />
      )}

      {/* Main layout */}
      <div className="flex gap-8 mt-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar filters={filters} updateFilter={updateFilter} onReset={resetFilters} />
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
                <FilterSidebar filters={filters} updateFilter={updateFilter} onReset={resetFilters} />
              </div>
            </div>
          </div>
        )}

        {/* Creator grid */}
        <div className="flex-1 min-w-0">
          <CreatorGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}