'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listingApi } from '@/src/lib/api';
import { toast } from 'sonner';

type Listing = {
  id: string;
  type: string;
  name: string;
  slug: string;
  status: string;
  is_visible: boolean;
  publicPath?: string;
  category?: string;
  city?: string;
  profile_views?: number;
};

export default function PortalListingContent() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [accountType, setAccountType] = useState('FREE_LISTING');
  const [enquiries, setEnquiries] = useState<Array<{ id: string; name: string; email: string; message: string }>>([]);
  const [analytics, setAnalytics] = useState<{ views: number; enquiries: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const mine = await listingApi.getMine();
      const row = mine.listing as Listing | null;
      setListing(row);
      setAccountType(mine.accountType);
      if (row) {
        const [stats, leads] = await Promise.all([listingApi.getAnalytics(), listingApi.getEnquiries()]);
        setAnalytics(stats);
        setEnquiries(leads);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading listing…</p>;

  if (!listing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-800">My Listing</h1>
        <p className="text-sm text-slate-500 mt-2">Create a free public Discover profile. This does not unlock campaigns or payments.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm" onClick={() => listingApi.create('BUSINESS').then(() => load())}>
            List as Business
          </button>
          <button type="button" className="border px-4 py-2 rounded-xl text-sm" onClick={() => listingApi.create('CREATOR').then(() => load())}>
            List as Creator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">My Listing</h1>
      <p className="text-sm text-slate-500 mt-1">Manage your public Discover profile from the existing portal. Brand/Creator tools stay separate.</p>

      <div className="grid sm:grid-cols-3 gap-3 mt-5">
        {[
          ['Status', listing.status],
          ['Views', String(analytics?.views ?? listing.profile_views ?? 0)],
          ['Enquiries', String(analytics?.enquiries ?? enquiries.length)],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border rounded-xl p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-white border rounded-2xl p-5">
        <h2 className="font-semibold">{listing.name}</h2>
        <p className="text-sm text-slate-500 mt-1">{listing.type} · {listing.category || 'Uncategorized'} · {listing.city || 'No city'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {listing.publicPath && (
            <a href={`https://viralbridgge-new.vercel.app${listing.publicPath}`} className="bg-violet-600 text-white text-sm px-4 py-2 rounded-xl" target="_blank" rel="noreferrer">
              View public profile
            </a>
          )}
          {listing.status === 'DRAFT' || listing.status === 'REJECTED' ? (
            <button type="button" className="border text-sm px-4 py-2 rounded-xl" onClick={() => listingApi.publish(listing.id).then(() => { toast.success('Submitted for review'); void load(); })}>
              Submit for review
            </button>
          ) : null}
          <button
            type="button"
            className="border text-sm px-4 py-2 rounded-xl"
            onClick={() => listingApi.unpublish(listing.id).then(() => { toast.success('Hidden from Discover'); void load(); })}
          >
            Hide from Discover
          </button>
        </div>
      </div>

      <div className="mt-5 bg-white border rounded-2xl p-5">
        <h3 className="font-semibold">Enquiries</h3>
        {enquiries.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">No enquiries yet.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {enquiries.map((item) => (
              <li key={item.id} className="py-3">
                <p className="font-medium text-sm">{item.name} · {item.email}</p>
                <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{item.message.replace(/\n\n\[ip:.*\]$/, '')}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {accountType === 'FREE_LISTING' && (
        <div className="mt-5 border rounded-2xl p-5 bg-slate-50">
          <h3 className="font-semibold">Want campaigns and payments?</h3>
          <p className="text-sm text-slate-500 mt-1">Upgrade keeps this listing and URL. It does not create a second account.</p>
          <Link href={listing.type === 'CREATOR' ? '/campaign-discovery' : '/brand-campaign-management'} className="inline-flex mt-3 bg-violet-600 text-white text-sm px-4 py-2 rounded-xl">
            Explore {listing.type === 'CREATOR' ? 'Creator' : 'Brand'} tools
          </Link>
        </div>
      )}
    </div>
  );
}
