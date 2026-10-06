'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/src/lib/api';

type Listing = {
  id: string;
  type: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  verified: boolean;
  featured: boolean;
  discoveryStatus?: string;
};

type FreeListing = {
  id: string;
  type: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  status: string;
  verified: boolean;
  is_featured: boolean;
  is_visible: boolean;
  ownerEmail: string;
};

export default function AdminDiscoveryContent() {
  const [items, setItems] = useState<Listing[]>([]);
  const [freeItems, setFreeItems] = useState<FreeListing[]>([]);
  const [tab, setTab] = useState<'accounts' | 'free' | 'reports'>('accounts');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<{ searches: number; views: number; contacts: number; enquiries: number } | null>(null);
  const [freeStats, setFreeStats] = useState<{ published: number; drafts: number; suspended: number; enquiries: number; openReports: number } | null>(null);
  const [reports, setReports] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, analytics, freeList, freeAnalytics, reportRows] = await Promise.all([
        adminApi.getDiscoveryListings({ q: search || undefined, limit: 50 }),
        adminApi.getDiscoveryAnalytics(),
        adminApi.getFreeListings({ q: search || undefined, limit: 50, status: 'all' }),
        adminApi.getFreeListingAnalytics(),
        adminApi.getFreeListingReports(),
      ]);
      setItems(((list.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        type: String(row.type),
        name: String(row.name),
        slug: String(row.slug ?? ''),
        category: String(row.category ?? ''),
        city: String(row.city ?? ''),
        verified: Boolean(row.verified),
        featured: Boolean(row.featured),
        discoveryStatus: String(row.discoveryStatus ?? row.discovery_status ?? 'ACTIVE'),
      })));
      setFreeItems(((freeList.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id),
        type: String(row.type),
        name: String(row.name),
        slug: String(row.slug ?? ''),
        category: String(row.category ?? ''),
        city: String(row.city ?? ''),
        status: String(row.status ?? 'DRAFT'),
        verified: Boolean(row.verified),
        is_featured: Boolean(row.is_featured ?? row.featured),
        is_visible: row.is_visible !== false,
        ownerEmail: String(row.ownerEmail ?? ''),
      })));
      setStats(analytics);
      setFreeStats(freeAnalytics);
      setReports(reportRows ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load discovery listings');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 250);
    return () => window.clearTimeout(t);
  }, [load]);

  const update = async (item: Listing, body: Record<string, unknown>) => {
    try {
      await adminApi.updateDiscoveryListing(item.type === 'CREATOR' ? 'creator' : 'business', item.id, body);
      toast.success('Listing updated');
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const updateFree = async (item: FreeListing, body: Record<string, unknown>) => {
    try {
      await adminApi.updateFreeListing(item.id, body);
      toast.success('Free listing updated');
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-slate-800">Discover listings</h1>
      <p className="text-sm text-slate-500 mt-1">Moderate Brand/Creator discovery profiles and Free Listings without mixing account types.</p>

      <div className="mt-4 flex gap-2">
        {[
          ['accounts', 'Brand / Creator'],
          ['free', 'Free listings'],
          ['reports', 'Reports'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as typeof tab)}
            className={`px-3 py-1.5 rounded-full text-sm border ${tab === id ? 'bg-violet-600 text-white border-violet-600' : 'bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'accounts' && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            ['Searches', stats.searches],
            ['Profile views', stats.views],
            ['Contact clicks', stats.contacts],
            ['Enquiries', stats.enquiries],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-semibold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
      {tab === 'free' && freeStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {[
            ['Published', freeStats.published],
            ['Drafts', freeStats.drafts],
            ['Suspended', freeStats.suspended],
            ['Enquiries', freeStats.enquiries],
            ['Open reports', freeStats.openReports],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-semibold text-slate-800 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search listings"
        className="mt-5 w-full max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      />

      <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : tab === 'reports' ? (
          reports.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No reports.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr key={String(row.id)} className="border-t border-slate-100">
                    <td className="px-4 py-3">{String((row.listing as { name?: string } | null)?.name ?? row.target_id)}</td>
                    <td className="px-4 py-3">{String(row.reason)}</td>
                    <td className="px-4 py-3">{String(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : tab === 'free' ? (
          freeItems.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No free listings found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {freeItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.type} · {item.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.city || '—'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button type="button" className="text-violet-700" onClick={() => updateFree(item, { verified: !item.verified })}>
                        {item.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button type="button" className="text-violet-700" onClick={() => updateFree(item, { is_featured: !item.is_featured })}>
                        {item.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      {item.status === 'SUSPENDED' ? (
                        <button type="button" className="text-emerald-700" onClick={() => updateFree(item, { status: 'PUBLISHED', is_visible: true })}>
                          Restore
                        </button>
                      ) : (
                        <button type="button" className="text-red-600" onClick={() => updateFree(item, { status: 'SUSPENDED', is_visible: false })}>
                          Suspend
                        </button>
                      )}
                      {item.status !== 'PUBLISHED' && (
                        <button type="button" className="text-emerald-700" onClick={() => updateFree(item, { status: 'PUBLISHED', is_visible: true })}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No listings found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.city || '—'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button type="button" className="text-violet-700" onClick={() => update(item, { verified: !item.verified })}>
                      {item.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button type="button" className="text-violet-700" onClick={() => update(item, { featured: !item.featured })}>
                      {item.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    {item.discoveryStatus === 'HIDDEN' ? (
                      <button type="button" className="text-emerald-700" onClick={() => update(item, { discovery_status: 'ACTIVE' })}>
                        Unhide
                      </button>
                    ) : (
                      <button type="button" className="text-red-600" onClick={() => update(item, { discovery_status: 'HIDDEN' })}>
                        Hide
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
