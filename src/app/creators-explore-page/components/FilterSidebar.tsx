'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { CreatorFilters } from './CreatorsExploreClient';

const CATEGORIES = [
  'Beauty & Skincare',
  'Fitness & Health',
  'Food & Cooking',
  'Fashion & Style',
  'Travel & Adventure',
  'Tech & Gadgets',
  'Gaming',
  'Lifestyle',
  'Education',
  'Finance',
  'Parenting',
  'Home & Decor',
  'Music & Entertainment',
  'Pets',
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Pinterest', 'LinkedIn'];

const ENGAGEMENT_PRESETS = [
  { label: 'Any', value: 0 },
  { label: '≥ 2%', value: 2 },
  { label: '≥ 4%', value: 4 },
  { label: '≥ 6%', value: 6 },
  { label: '≥ 8%', value: 8 },
];

interface FilterSidebarProps {
  filters: CreatorFilters;
  updateFilter: <K extends keyof CreatorFilters>(key: K, value: CreatorFilters[K]) => void;
  onReset: () => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E5E7EB] pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="font-display font-700 text-[#1F1F2E] text-sm">{title}</span>
        {open ? (
          <ChevronUp size={15} className="text-[#9AA0B4] group-hover:text-[#6B6B8A] transition-colors" />
        ) : (
          <ChevronDown size={15} className="text-[#9AA0B4] group-hover:text-[#6B6B8A] transition-colors" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function FilterSidebar({ filters, updateFilter, onReset }: FilterSidebarProps) {
  const toggleCategory = (cat: string) => {
    updateFilter(
      'categories',
      filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat]
    );
  };

  const togglePlatform = (p: string) => {
    updateFilter(
      'platforms',
      filters.platforms.includes(p)
        ? filters.platforms.filter((pl) => pl !== p)
        : [...filters.platforms, p]
    );
  };

  const activeCount =
    filters.categories.length +
    filters.platforms.length +
    (filters.followersMin > 0 || filters.followersMax < 5000000 ? 1 : 0) +
    (filters.engagementMin > 0 ? 1 : 0) +
    (filters.rateMax < 10000 ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-700 text-[#1F1F2E] text-base">Filters</h3>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#7B2FF7] text-white text-[10px] font-700 font-display flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-[#9AA0B4] hover:text-[#7B2FF7] text-xs font-medium transition-colors"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Content Category">
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <label
              key={`filter-cat-${cat}`}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <div
                onClick={() => toggleCategory(cat)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 flex-shrink-0 cursor-pointer ${
                  filters.categories.includes(cat)
                    ? 'bg-[#7B2FF7] border-[#7B2FF7]'
                    : 'border-[#D1D5DB] group-hover:border-[#7B2FF7]'
                }`}
              >
                {filters.categories.includes(cat) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleCategory(cat)}
                className={`text-sm transition-colors ${
                  filters.categories.includes(cat) ? 'text-[#7B2FF7] font-medium' : 'text-[#6B6B8A] group-hover:text-[#1F1F2E]'
                }`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Platform */}
      <FilterSection title="Platform">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={`filter-platform-${p}`}
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.platforms.includes(p)
                  ? 'bg-[#7B2FF7] border-[#7B2FF7] text-white'
                  : 'border-[#E5E7EB] text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Followers range */}
      <FilterSection title="Follower Count">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#9AA0B4] font-medium">
            <span className="tabular-nums">{formatFollowers(filters.followersMin)}</span>
            <span className="tabular-nums">{formatFollowers(filters.followersMax)}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[#9AA0B4] text-xs mb-1 block">Minimum</label>
              <input
                type="range"
                min={0}
                max={5000000}
                step={10000}
                value={filters.followersMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < filters.followersMax) updateFilter('followersMin', val);
                }}
                className="w-full accent-[#7B2FF7] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[#9AA0B4] text-xs mb-1 block">Maximum</label>
              <input
                type="range"
                min={0}
                max={5000000}
                step={10000}
                value={filters.followersMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > filters.followersMin) updateFilter('followersMax', val);
                }}
                className="w-full accent-[#7B2FF7] cursor-pointer"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Nano', min: 1000, max: 10000 },
              { label: 'Micro', min: 10000, max: 50000 },
              { label: 'Mid', min: 50000, max: 500000 },
              { label: 'Macro', min: 500000, max: 5000000 },
            ].map((preset) => (
              <button
                key={`followers-preset-${preset.label}`}
                onClick={() => {
                  updateFilter('followersMin', preset.min);
                  updateFilter('followersMax', preset.max);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-150 ${
                  filters.followersMin === preset.min && filters.followersMax === preset.max
                    ? 'bg-[#EFEAFF] border-[#7B2FF7] text-[#7B2FF7]'
                    : 'border-[#E5E7EB] text-[#9AA0B4] hover:border-[#7B2FF7] hover:text-[#7B2FF7]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Engagement rate */}
      <FilterSection title="Min. Engagement Rate">
        <div className="flex flex-wrap gap-2">
          {ENGAGEMENT_PRESETS.map((preset) => (
            <button
              key={`engagement-preset-${preset.value}`}
              onClick={() => updateFilter('engagementMin', preset.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.engagementMin === preset.value
                  ? 'bg-[#7B2FF7] border-[#7B2FF7] text-white'
                  : 'border-[#E5E7EB] text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Max rate per post */}
      <FilterSection title="Max Rate per Post" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9AA0B4] font-medium">
            <span>$0</span>
            <span className="tabular-nums font-semibold text-[#1F1F2E]">
              {filters.rateMax === 10000 ? 'Any' : `$${filters.rateMax.toLocaleString()}`}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={10000}
            step={100}
            value={filters.rateMax}
            onChange={(e) => updateFilter('rateMax', Number(e.target.value))}
            className="w-full accent-[#7B2FF7] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#9AA0B4]">
            <span>$500</span>
            <span>$10,000+</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}