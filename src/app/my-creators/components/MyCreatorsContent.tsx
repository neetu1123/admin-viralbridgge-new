'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, Users, TrendingUp, Star, MessageSquare, DollarSign, Calendar, ChevronDown, UserCheck, MoreHorizontal, Loader2 } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import Link from 'next/link';
import { brandApi } from '@/src/lib/api';
import { extractList, extractMeta, mapMyCreatorsFromApplications, type MyCreatorRow } from '@/src/lib/mappers';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function MyCreatorsContent() {
  const [creators, setCreators] = useState<MyCreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.getMyCreators({
        search: search || undefined,
        limit: 100,
      });
      const rawList = extractList<Record<string, unknown>>(res);
      setCreators(mapMyCreatorsFromApplications(rawList));
      setTotalCount(extractMeta(res).total ?? rawList.length);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load creators');
      setCreators([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadCreators(), 300);
    return () => clearTimeout(timer);
  }, [loadCreators]);

  const filtered = useMemo(() => {
    return creators.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.handle.toLowerCase().includes(search.toLowerCase()) ||
        c.niche.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [creators, search, statusFilter]);

  const totalPaid = creators.reduce((s, c) => s + c.totalPaid, 0);
  const activeCount = creators.filter(c => c.status === 'active').length;
  const avgRating = creators.length
    ? (creators.reduce((s, c) => s + c.rating, 0) / creators.length).toFixed(1)
    : '—';

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Creators</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your creator relationships and collaboration history</p>
        </div>
        <Link href="/creator-discovery" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150 shadow-sm">
          <Users size={15} />
          Discover Creators
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Creators</p>
          <p className="text-2xl font-bold text-slate-800">{loading ? '—' : creators.length}</p>
          <p className="text-xs text-slate-400 mt-1">{activeCount} currently active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Paid Out</p>
          <p className="text-2xl font-bold text-slate-800 tabular-nums">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">across all campaigns</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Avg. Creator Rating</p>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold text-emerald-700">{avgRating}</p>
            {creators.length > 0 && <Star size={16} className="text-amber-400 fill-amber-400" />}
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            {creators.length > 0 ? 'Based on engagement' : 'No creators yet'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Collabs</p>
          <p className="text-2xl font-bold text-slate-800">{creators.reduce((s, c) => s + c.totalCollabs, 0)}</p>
          <p className="text-xs text-slate-400 mt-1">completed deliverables</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <p className="text-xs text-slate-400 ml-auto">
          {loading ? 'Loading…' : `${filtered.length} creator${filtered.length !== 1 ? 's' : ''}`}
          {!loading && totalCount > creators.length ? ` (${totalCount} collabs)` : ''}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Loading your creators…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Users size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {creators.length === 0 ? 'No creators yet' : 'No matching creators'}
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            {creators.length === 0
              ? 'Creators who accept your campaign invitations will appear here.'
              : 'Try adjusting your search or status filter.'}
          </p>
          {creators.length === 0 && (
            <Link
              href="/creator-discovery"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              <Users size={15} />
              Discover Creators
            </Link>
          )}
        </div>
      )}

      {/* Creator Cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(creator => (
            <div key={creator.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-700 text-sm font-bold">{creator.avatar}</span>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{creator.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[creator.status]}`}>
                          {creator.status.charAt(0).toUpperCase() + creator.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-violet-600 font-medium mt-0.5">{creator.handle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-slate-700">{creator.rating}</span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === creator.id ? null : creator.id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {openMenuId === creator.id && (
                          <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-40 py-1">
                            <button onClick={() => { toast.success('Added to favorites'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Add to Favorites</button>
                            <button onClick={() => { toast.info('Creator tagged'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Add Tag</button>
                            <hr className="my-1 border-slate-100" />
                            <button onClick={() => { toast.error('Creator removed'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Remove</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Platform + Niche */}
                  <div className="flex items-center gap-2 mb-3">
                    <PlatformBadge platform={creator.platform} />
                    <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md">{creator.niche}</span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700 tabular-nums">{(creator.followers / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-slate-400">followers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={13} className={creator.engagementRate >= 5 ? 'text-emerald-500' : 'text-amber-500'} />
                      <div>
                        <p className={`text-xs font-semibold tabular-nums ${creator.engagementRate >= 5 ? 'text-emerald-700' : 'text-amber-700'}`}>{creator.engagementRate}%</p>
                        <p className="text-xs text-slate-400">engagement</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-violet-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700 tabular-nums">₹{creator.totalPaid.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">total paid</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {creator.lastCollab
                            ? new Date(creator.lastCollab).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : '—'}
                        </p>
                        <p className="text-xs text-slate-400">last collab</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {creator.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {creator.tags.map(tag => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tag === 'top-performer' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Campaigns */}
                  {creator.campaigns.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">Campaigns:</span>
                      {creator.campaigns.map(camp => (
                        <span key={camp} className="text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">{camp}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href="/messaging-inbox" className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                    <MessageSquare size={13} />
                    Message
                  </Link>
                  <Link
                    href={`/creator-discovery?invite=${creator.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <UserCheck size={13} />
                    Re-invite
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
