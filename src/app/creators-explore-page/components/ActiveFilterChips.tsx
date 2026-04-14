'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { CreatorFilters } from './CreatorsExploreClient';

interface ActiveFilterChipsProps {
  filters: CreatorFilters;
  updateFilter: <K extends keyof CreatorFilters>(key: K, value: CreatorFilters[K]) => void;
  onReset: () => void;
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function ActiveFilterChips({ filters, updateFilter, onReset }: ActiveFilterChipsProps) {
  const chips: { id: string; label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({
      id: 'chip-search',
      label: `"${filters.search}"`,
      onRemove: () => updateFilter('search', ''),
    });
  }

  filters.categories.forEach((cat) => {
    chips.push({
      id: `chip-cat-${cat}`,
      label: cat,
      onRemove: () => updateFilter('categories', filters.categories.filter((c) => c !== cat)),
    });
  });

  filters.platforms.forEach((p) => {
    chips.push({
      id: `chip-platform-${p}`,
      label: p,
      onRemove: () => updateFilter('platforms', filters.platforms.filter((pl) => pl !== p)),
    });
  });

  if (filters.followersMin > 0 || filters.followersMax < 5000000) {
    chips.push({
      id: 'chip-followers',
      label: `${formatFollowers(filters.followersMin)} – ${formatFollowers(filters.followersMax)} followers`,
      onRemove: () => { updateFilter('followersMin', 0); updateFilter('followersMax', 5000000); },
    });
  }

  if (filters.engagementMin > 0) {
    chips.push({
      id: 'chip-engagement',
      label: `≥ ${filters.engagementMin}% engagement`,
      onRemove: () => updateFilter('engagementMin', 0),
    });
  }

  if (filters.rateMax < 10000) {
    chips.push({
      id: 'chip-rate',
      label: `Rate ≤ $${filters.rateMax.toLocaleString()}`,
      onRemove: () => updateFilter('rateMax', 10000),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-[#9AA0B4] text-xs font-medium">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 bg-[#EFEAFF] text-[#7B2FF7] text-xs font-semibold px-3 py-1.5 rounded-full"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:text-[#5B1FD7] transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 text-[#9AA0B4] hover:text-[#6B6B8A] text-xs font-medium transition-colors ml-1"
      >
        <RotateCcw size={11} />
        Clear all
      </button>
    </div>
  );
}