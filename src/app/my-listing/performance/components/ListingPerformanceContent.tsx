'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Eye,
  MessageCircle,
  Phone,
  Globe,
  Mail,
  Search,
  MousePointerClick,
  Store,
} from 'lucide-react';
import { listingApi } from '@/src/lib/api';
import { toast } from 'sonner';

type Analytics = {
  listing?: { id: string; name: string; slug: string; status: string } | null;
  views: number;
  enquiries: number;
  contacts: number;
  searches: number;
  whatsapp?: number;
  calls?: number;
  website?: number;
  contactClicks?: number;
  enquiryEvents?: number;
  last30Days?: Record<string, number>;
  totals?: Record<string, number>;
};

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  created_at: string;
};

const THIRTY_DAY_LABELS: Array<{ key: string; label: string }> = [
  { key: 'profile_view', label: 'Profile views' },
  { key: 'whatsapp_click', label: 'WhatsApp clicks' },
  { key: 'enquiry_sent', label: 'Enquiry form' },
  { key: 'call_click', label: 'Call clicks' },
  { key: 'website_click', label: 'Website clicks' },
  { key: 'contact_click', label: 'Contact clicks' },
  { key: 'search', label: 'Search appearances' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function cleanMessage(message: string) {
  return message.replace(/\n\n\[ip:.*\]$/, '').trim();
}

export default function ListingPerformanceContent() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [stats, leads] = await Promise.all([listingApi.getAnalytics(), listingApi.getEnquiries()]);
        if (cancelled) return;
        setAnalytics(stats);
        setEnquiries(leads);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Failed to load listing performance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading listing performance…</p>;
  }

  const listing = analytics?.listing;
  const last30 = analytics?.last30Days ?? {};
  const hasListing = Boolean(listing?.id);

  const cards = [
    { label: 'Profile views', value: analytics?.views ?? 0, hint: 'People who opened your listing', icon: Eye, tone: 'from-violet-500 to-violet-600' },
    { label: 'WhatsApp clicks', value: analytics?.whatsapp ?? 0, hint: 'Taps on WhatsApp contact', icon: MessageCircle, tone: 'from-emerald-500 to-emerald-600' },
    { label: 'Enquiry form', value: analytics?.enquiries ?? 0, hint: 'Leads submitted on your listing', icon: Mail, tone: 'from-sky-500 to-sky-600' },
    { label: 'Call clicks', value: analytics?.calls ?? 0, hint: 'Taps on call / phone', icon: Phone, tone: 'from-amber-500 to-amber-600' },
    { label: 'Website clicks', value: analytics?.website ?? 0, hint: 'Taps on website link', icon: Globe, tone: 'from-indigo-500 to-indigo-600' },
    { label: 'Contact clicks', value: analytics?.contactClicks ?? 0, hint: 'Other contact taps', icon: MousePointerClick, tone: 'from-rose-500 to-rose-600' },
    { label: 'Search appearances', value: analytics?.searches ?? 0, hint: 'Times shown in Discover search', icon: Search, tone: 'from-slate-600 to-slate-700' },
    { label: 'All contact actions', value: analytics?.contacts ?? 0, hint: 'WhatsApp + call + contact', icon: Activity, tone: 'from-fuchsia-500 to-fuchsia-600' },
  ];

  return (
    <div className="pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Listing Performance</h1>
          <p className="text-slate-500 text-sm mt-1">
            Profile views, WhatsApp clicks, enquiry form leads, and other Discover analytics
            {listing?.name ? ` for ${listing.name}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/my-listing"
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150 shadow-sm"
          >
            <Store size={16} />
            Manage listing
          </Link>
        </div>
      </div>

      {!hasListing ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-800">No listing yet</h2>
          <p className="text-sm text-slate-500 mt-2">
            Create a Discover listing first. Performance metrics appear once people view or contact your business.
          </p>
          <Link href="/my-listing" className="inline-flex mt-5 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
            Create listing
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
              {listing?.status || 'DRAFT'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`bg-gradient-to-br ${card.tone} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon size={15} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-black tabular-nums mb-1">{card.value}</p>
                  <p className="text-white/75 text-xs">{card.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-slate-800">Last 30 days</h2>
            <p className="text-sm text-slate-500 mt-1">Click and view activity recorded on your public listing.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {THIRTY_DAY_LABELS.map((item) => (
                <div key={item.key} className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1 tabular-nums">{last30[item.key] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800">Enquiry form leads</h2>
                <p className="text-sm text-slate-500 mt-1">{enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'} received</p>
              </div>
            </div>
            {enquiries.length === 0 ? (
              <p className="text-sm text-slate-500 mt-4">No enquiry form submissions yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 pr-3 font-medium">Email</th>
                      <th className="py-2 pr-3 font-medium">Phone</th>
                      <th className="py-2 pr-3 font-medium">Message</th>
                      <th className="py-2 font-medium">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 align-top">
                        <td className="py-3 pr-3 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                        <td className="py-3 pr-3 text-slate-600 whitespace-nowrap">{item.email}</td>
                        <td className="py-3 pr-3 text-slate-600 whitespace-nowrap">{item.phone || '—'}</td>
                        <td className="py-3 pr-3 text-slate-600 max-w-xs whitespace-pre-wrap">{cleanMessage(item.message)}</td>
                        <td className="py-3 text-slate-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
