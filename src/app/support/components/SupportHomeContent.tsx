'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Search, MessageCircle, Loader2, ChevronRight, LifeBuoy } from 'lucide-react';
import { supportApi } from '@/src/lib/api';
import type { SupportCategory, SupportSearchResult } from '@/src/lib/support/types';
import { getSupportIcon } from '@/src/components/support/supportIcons';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SupportHomeContent() {
  const router = useRouter();
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SupportSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportApi.getCategories();
      setCategories(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load support');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    supportApi
      .search(debouncedSearch)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-4xl">
      <Toaster position="bottom-right" richColors />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <LifeBuoy className="text-violet-600" size={24} />
          <h1 className="text-2xl font-bold text-slate-800">ViralBridge Support</h1>
        </div>
        <p className="text-slate-500 text-sm">Hi! What can we help you with today?</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for help... (payment, campaign, upload, withdrawal)"
          className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      {debouncedSearch.trim() && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {searching ? (
            <p className="p-4 text-sm text-slate-500">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No results found.</p>
          ) : (
            searchResults.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => router.push(`/support/issue/${r.id}`)}
                className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.categoryName} → {r.subcategoryName}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {categories.map((cat) => {
          const Icon = getSupportIcon(cat.icon);
          return (
            <Link
              key={cat.id}
              href={`/support/category/${cat.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{cat.name}</p>
                  {cat.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cat.description}</p>}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-800 text-sm">Can&apos;t find what you need?</p>
          <p className="text-xs text-slate-500 mt-0.5">Chat with our support team — we&apos;ll keep your context.</p>
        </div>
        <Link
          href="/support/case/new"
          className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <MessageCircle size={16} /> Chat with Admin
        </Link>
      </div>

      <div className="mt-4">
        <Link href="/support/cases" className="text-sm text-violet-600 font-medium hover:underline">
          View my support cases →
        </Link>
      </div>
    </div>
  );
}
