'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  category?: string | null;
  subcategory?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  short_description?: string | null;
  description?: string | null;
  services?: string[];
  languages?: string[];
  social_links?: Record<string, string> | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  gallery?: string[];
  is_phone_public?: boolean;
  is_email_public?: boolean;
  is_whatsapp_public?: boolean;
  is_website_public?: boolean;
  is_address_public?: boolean;
  profile_views?: number;
  rejection_reason?: string | null;
};

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Chennai', 'Kolkata', 'Noida', 'Gurgaon', 'Jaipur', 'Lucknow'];
const FALLBACK_CATEGORIES = ['Beauty', 'Fitness', 'Food', 'Health', 'Education', 'Retail', 'Services', 'Salon', 'Gym', 'Cafe'];
const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://viralbridgge-new.vercel.app';

const emptyForm = {
  name: '',
  category: '',
  subcategory: '',
  short_description: '',
  description: '',
  city: '',
  area: '',
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  website: '',
  services: '',
  languages: '',
  instagram: '',
  youtube: '',
  is_phone_public: false,
  is_email_public: false,
  is_whatsapp_public: true,
  is_website_public: true,
  is_address_public: false,
  logo_url: '',
  cover_image_url: '',
};

export default function PortalListingContent() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [featureAccess, setFeatureAccess] = useState<'LIMITED' | 'FULL'>('FULL');
  const [enquiries, setEnquiries] = useState<Array<{ id: string; name: string; email: string; message: string }>>([]);
  const [analytics, setAnalytics] = useState<{ views: number; enquiries: number } | null>(null);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const hydrate = (row: Listing) => {
    const social = row.social_links || {};
    setForm({
      name: row.name || '',
      category: row.category || '',
      subcategory: row.subcategory || '',
      short_description: row.short_description || '',
      description: row.description || '',
      city: row.city || '',
      area: row.area || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      whatsapp: row.whatsapp || '',
      website: row.website || '',
      services: (row.services || []).join(', '),
      languages: (row.languages || []).join(', '),
      instagram: social.instagram || '',
      youtube: social.youtube || '',
      is_phone_public: Boolean(row.is_phone_public),
      is_email_public: Boolean(row.is_email_public),
      is_whatsapp_public: row.is_whatsapp_public !== false,
      is_website_public: row.is_website_public !== false,
      is_address_public: Boolean(row.is_address_public),
      logo_url: row.logo_url || '',
      cover_image_url: row.cover_image_url || '',
    });
  };

  const payload = useMemo(
    () => ({
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      short_description: form.short_description,
      description: form.description,
      city: form.city,
      area: form.area,
      address: form.address,
      phone: form.phone,
      email: form.email,
      whatsapp: form.whatsapp,
      website: form.website,
      services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
      social_links: {
        ...(form.instagram ? { instagram: form.instagram } : {}),
        ...(form.youtube ? { youtube: form.youtube } : {}),
      },
      is_phone_public: form.is_phone_public,
      is_email_public: form.is_email_public,
      is_whatsapp_public: form.is_whatsapp_public,
      is_website_public: form.is_website_public,
      is_address_public: form.is_address_public,
      logo_url: form.logo_url || undefined,
      cover_image_url: form.cover_image_url || undefined,
    }),
    [form],
  );

  const load = async () => {
    setLoading(true);
    try {
      const mine = await listingApi.getMine();
      const row = mine.listing as Listing | null;
      setListing(row);
      setFeatureAccess(mine.featureAccess === 'LIMITED' ? 'LIMITED' : 'FULL');
      if (row) {
        hydrate(row);
        setEditing(!row.category || !row.city);
        const [stats, leads] = await Promise.all([listingApi.getAnalytics(), listingApi.getEnquiries()]);
        setAnalytics(stats);
        setEnquiries(leads);
      } else {
        setEditing(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    listingApi.getCategories('business')
      .then((rows) => {
        const names = rows.map((row) => row.name).filter(Boolean);
        if (names.length) setCategories(names);
      })
      .catch(() => undefined);
  }, []);

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createListing = async () => {
    setSaving(true);
    try {
      const created = await listingApi.create('BUSINESS', form.name || undefined) as Listing;
      setListing(created);
      hydrate(created);
      setEditing(true);
      toast.success('Listing started. Add your business details to publish.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start listing');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!listing) return;
    if (!form.name.trim() || !form.category.trim() || !form.city.trim()) {
      toast.error('Name, category, and city are required');
      return;
    }
    setSaving(true);
    try {
      const updated = await listingApi.update(listing.id, payload) as Listing;
      setListing(updated);
      hydrate(updated);
      toast.success('Listing saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save listing');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!listing) return;
    setSaving(true);
    try {
      await listingApi.update(listing.id, payload);
      const updated = await listingApi.publish(listing.id) as Listing;
      setListing(updated);
      setEditing(false);
      toast.success('Submitted for review');
      void load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File, field: 'logo_url' | 'cover_image_url') => {
    try {
      const uploaded = await listingApi.uploadImage(file);
      setField(field, uploaded.url);
      if (listing) {
        await listingApi.update(listing.id, { [field]: uploaded.url });
      }
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading listing…</p>;

  if (!listing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h1 className="text-xl font-semibold text-slate-800">List your business</h1>
        <p className="text-sm text-slate-500 mt-2">
          You are logged in. Create a public Discover profile for this Brand account. Campaigns stay locked until admin approval.
        </p>
        <label className="block mt-5 text-sm font-medium text-slate-700">
          Business name
          <input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            placeholder="e.g. Luminary Studio"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          className="mt-5 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          onClick={() => void createListing()}
        >
          {saving ? 'Starting…' : 'Create business listing'}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Listing</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the public Discover profile for this Brand account.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.publicPath ? (
            <a href={`${PUBLIC_SITE}${listing.publicPath}`} className="border text-sm px-4 py-2 rounded-xl" target="_blank" rel="noreferrer">
              View public profile
            </a>
          ) : null}
          <button type="button" className="border text-sm px-4 py-2 rounded-xl" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Close editor' : 'Edit listing'}
          </button>
        </div>
      </div>

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

      {listing.rejection_reason ? (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{listing.rejection_reason}</p>
      ) : null}

      {editing ? (
        <div className="mt-5 bg-white border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Business details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">
              Business name
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Category
              <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Subcategory
              <input value={form.subcategory} onChange={(e) => setField('subcategory', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              City
              <select value={form.city} onChange={(e) => setField('city', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">Select city</option>
                {CITIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Area
              <input value={form.area} onChange={(e) => setField('area', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Address
              <input value={form.address} onChange={(e) => setField('address', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="text-sm font-medium text-slate-700 block">
            Short description
            <input value={form.short_description} onChange={(e) => setField('short_description', e.target.value)} maxLength={200} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium text-slate-700 block">
            About the business
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={4} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              WhatsApp
              <input value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input value={form.email} onChange={(e) => setField('email', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Website
              <input value={form.website} onChange={(e) => setField('website', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Products / services
              <input value={form.services} onChange={(e) => setField('services', e.target.value)} placeholder="Comma separated" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Languages
              <input value={form.languages} onChange={(e) => setField('languages', e.target.value)} placeholder="Hindi, English" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Instagram
              <input value={form.instagram} onChange={(e) => setField('instagram', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              YouTube
              <input value={form.youtube} onChange={(e) => setField('youtube', e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">
              Logo
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0], 'logo_url')} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Cover image
              <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0], 'cover_image_url')} />
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {[
              ['is_phone_public', 'Show phone'],
              ['is_email_public', 'Show email'],
              ['is_whatsapp_public', 'Show WhatsApp'],
              ['is_website_public', 'Show website'],
              ['is_address_public', 'Show address'],
            ].map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(e) => setField(key as keyof typeof form, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={saving} onClick={() => void save()} className="border text-sm px-4 py-2 rounded-xl disabled:opacity-60">
              Save details
            </button>
            <button type="button" disabled={saving} onClick={() => void publish()} className="bg-violet-600 text-white text-sm px-4 py-2 rounded-xl disabled:opacity-60">
              Submit for review
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 bg-white border rounded-2xl p-5">
          <h2 className="font-semibold">{listing.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{listing.category || 'Uncategorized'} · {listing.city || 'No city'}</p>
          {listing.short_description ? <p className="text-sm text-slate-600 mt-3">{listing.short_description}</p> : null}
        </div>
      )}

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

      {featureAccess !== 'FULL' && (
        <div className="mt-5 border rounded-2xl p-5 bg-slate-50">
          <h3 className="font-semibold">Want campaigns and payments?</h3>
          <p className="text-sm text-slate-500 mt-1">Keep this listing. Subscribe or wait for admin approval to unlock the rest of the Brand portal.</p>
          <Link href="/subscription" className="inline-flex mt-3 bg-violet-600 text-white text-sm px-4 py-2 rounded-xl">
            Open subscription
          </Link>
        </div>
      )}
    </div>
  );
}
