'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { CampaignFilters } from './CampaignsExploreClient';

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
  'Wellness',
  'Home & Decor',
  'Music & Entertainment',
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Pinterest', 'LinkedIn'];

const DEADLINE_OPTIONS = [
  { label: 'Any deadline', value: '' },
  { label: 'Next 7 days', value: '7' },
  { label: 'Next 14 days', value: '14' },
  { label: 'Next 30 days', value: '30' },
  { label: 'Next 60 days', value: '60' },
];

interface CampaignFilterSidebarProps {
  filters: CampaignFilters;
  updateFilter: <K extends keyof CampaignFilters>(key: K, value: CampaignFilters[K]) => void;
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

function formatBudget(n: number): string {
  if (n >= 1000) return `₹₹{(n / 1000).toFixed(0)}K`;
  return `₹₹{n}`;
}

export default function CampaignFilterSidebar({ filters, updateFilter, onReset }: CampaignFilterSidebarProps) {
  const togglePlatform = (p: string) => {
    updateFilter(
      'platforms',
      filters.platforms.includes(p)
        ? filters.platforms.filter((pl) => pl !== p)
        : [...filters.platforms, p]
    );
  };

  const toggleCategory = (cat: string) => {
    updateFilter(
      'categories',
      filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat]
    );
  };

  const activeCount =
    filters.platforms.length +
    filters.categories.length +
    (filters.budgetMin > 0 || filters.budgetMax < 50000 ? 1 : 0) +
    (filters.deadline ? 1 : 0);

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

      {/* Budget Range */}
      <FilterSection title="Budget Range">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#9AA0B4] font-medium">
            <span className="tabular-nums">{formatBudget(filters.budgetMin)}</span>
            <span className="tabular-nums">{formatBudget(filters.budgetMax)}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[#9AA0B4] text-xs mb-1 block">Minimum</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={filters.budgetMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < filters.budgetMax) updateFilter('budgetMin', val);
                }}
                className="w-full accent-[#7B2FF7] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[#9AA0B4] text-xs mb-1 block">Maximum</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={filters.budgetMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > filters.budgetMin) updateFilter('budgetMax', val);
                }}
                className="w-full accent-[#7B2FF7] cursor-pointer"
              />
            </div>
          </div>
          {/* Budget presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Under ₹1K', min: 0, max: 1000 },
              { label: '₹1K–₹5K', min: 1000, max: 5000 },
              { label: '₹5K–₹15K', min: 5000, max: 15000 },
              { label: '₹15K+', min: 15000, max: 50000 },
            ].map((preset) => (
              <button
                key={`budget-preset-₹{preset.label}`}
                onClick={() => {
                  updateFilter('budgetMin', preset.min);
                  updateFilter('budgetMax', preset.max);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-150 ₹{
                  filters.budgetMin === preset.min && filters.budgetMax === preset.max
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

      {/* Platform */}
      <FilterSection title="Platform">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={`filter-platform-₹{p}`}
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ₹{
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

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {CATEGORIES.map((cat) => (
            <label
              key={`filter-cat-₹{cat}`}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5"
            >
              <div
                onClick={() => toggleCategory(cat)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 flex-shrink-0 cursor-pointer ₹{
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
                className={`text-sm transition-colors ₹{
                  filters.categories.includes(cat) ? 'text-[#7B2FF7] font-medium' : 'text-[#6B6B8A] group-hover:text-[#1F1F2E]'
                }`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Deadline */}
      <FilterSection title="Deadline">
        <div className="space-y-1.5">
          {DEADLINE_OPTIONS.map((opt) => (
            <button
              key={`deadline-₹{opt.value}`}
              onClick={() => updateFilter('deadline', opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ₹{
                filters.deadline === opt.value
                  ? 'bg-[#EFEAFF] text-[#7B2FF7] font-medium'
                  : 'text-[#6B6B8A] hover:bg-[#F2F3F7] hover:text-[#1F1F2E]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
