'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Loader2, Building2, Megaphone, Search } from 'lucide-react';
import { adminApi } from '@/src/lib/api';

const PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'] as const;
const STATUSES = ['DRAFT', 'ACTIVE', 'PENDING_APPROVAL'] as const;

interface BrandOption {
  id: string;
  companyName: string;
  email: string;
  industry?: string;
}

interface AdminCreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCreateCampaignModal({ open, onClose, onSuccess }: AdminCreateCampaignModalProps) {
  const [brandMode, setBrandMode] = useState<'existing' | 'new'>('existing');
  const [brandSearch, setBrandSearch] = useState('');
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [brandId, setBrandId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>('INSTAGRAM');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('DRAFT');
  const [totalBudget, setTotalBudget] = useState('');
  const [creatorBudget, setCreatorBudget] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [locality, setLocality] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');
  const [minimumFollowers, setMinimumFollowers] = useState('');
  const [maximumFollowers, setMaximumFollowers] = useState('');
  const [minimumEngagementRate, setMinimumEngagementRate] = useState('');
  const [numberOfPosts, setNumberOfPosts] = useState('');
  const [numberOfReels, setNumberOfReels] = useState('');
  const [numberOfStories, setNumberOfStories] = useState('');
  const [numberOfVideos, setNumberOfVideos] = useState('');
  const [customDeliverables, setCustomDeliverables] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [campaignBrief, setCampaignBrief] = useState('');
  const [referenceFiles, setReferenceFiles] = useState('');
  const [brandAssets, setBrandAssets] = useState('');

  const loadBrands = useCallback(async (search?: string) => {
    setLoadingBrands(true);
    try {
      const res = await adminApi.searchBrands({ search, limit: 20 });
      setBrands(res.data.map((b) => ({ id: b.id, companyName: b.companyName, email: b.email, industry: b.industry })));
    } catch {
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    if (open && brandMode === 'existing') void loadBrands();
  }, [open, brandMode, loadBrands]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (brandMode === 'existing') void loadBrands(brandSearch || undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [brandSearch, brandMode, open, loadBrands]);

  const buildPayload = (): Record<string, unknown> => ({
    ...(brandMode === 'existing' ? { brandId } : { companyName, contactPerson, email, phone, website, industry }),
    title,
    description,
    platform,
    status,
    totalBudget: Number(totalBudget) || 0,
    creatorBudget: Number(creatorBudget) || 0,
    platformFee: Number(platformFee) || 0,
    locality: locality.split(',').map((s) => s.trim()).filter(Boolean),
    languages: languages.split(',').map((s) => s.trim()).filter(Boolean),
    minimumFollowers: Number(minimumFollowers) || 0,
    maximumFollowers: Number(maximumFollowers) || 0,
    minimumEngagementRate: Number(minimumEngagementRate) || 0,
    numberOfPosts: Number(numberOfPosts) || 0,
    numberOfReels: Number(numberOfReels) || 0,
    numberOfStories: Number(numberOfStories) || 0,
    numberOfVideos: Number(numberOfVideos) || 0,
    customDeliverables: customDeliverables.split('\n').map((s) => s.trim()).filter(Boolean),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    applicationDeadline: applicationDeadline || endDate || undefined,
    campaignBrief: campaignBrief || undefined,
    referenceFiles: referenceFiles.split('\n').map((s) => s.trim()).filter(Boolean),
    brandAssets: brandAssets.split('\n').map((s) => s.trim()).filter(Boolean),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandMode === 'existing' && !brandId) {
      toast.error('Please select a brand');
      return;
    }
    if (brandMode === 'new' && (!companyName.trim() || !email.trim())) {
      toast.error('Company name and email are required for new brands');
      return;
    }
    if (!title.trim() || !description.trim() || !totalBudget) {
      toast.error('Title, description, and total budget are required');
      return;
    }
    if (!applicationDeadline && !endDate) {
      toast.error('Application deadline or end date is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (brandMode === 'existing') {
        const res = await adminApi.createCampaignForBrand(payload);
        toast.success(`Campaign created for ${(res as { brand?: { companyName?: string } }).brand?.companyName ?? 'brand'}`);
      } else {
        const res = await adminApi.createCampaignWithBrand(payload);
        if (res.invitationNote) toast.info(res.invitationNote, { duration: 8000 });
        toast.success(`Brand and campaign created: ${res.campaign.title}`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Create Campaign for Brand</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enterprise client support — campaign owned by the brand account</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-violet-600" />
              <h3 className="text-sm font-bold text-slate-800">Brand Selection</h3>
            </div>
            <div className="flex gap-2 mb-4">
              {(['existing', 'new'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBrandMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    brandMode === mode
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode === 'existing' ? 'Existing Brand' : 'Create New Brand'}
                </button>
              ))}
            </div>

            {brandMode === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search brands by name or email..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className={`${inputCls} pl-9`}
                  />
                </div>
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputCls} required={brandMode === 'existing'}>
                  <option value="">{loadingBrands ? 'Loading brands...' : 'Select a brand'}</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.companyName} — {b.email}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Company Name *</label><input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required /></div>
                <div><label className={labelCls}>Contact Person</label><input className={inputCls} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} /></div>
                <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><label className={labelCls}>Phone</label><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div><label className={labelCls}>Website</label><input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></div>
                <div><label className={labelCls}>Industry</label><input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} /></div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone size={16} className="text-violet-600" />
              <h3 className="text-sm font-bold text-slate-800">Campaign Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2"><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="md:col-span-2"><label className={labelCls}>Description *</label><textarea className={`${inputCls} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
              <div>
                <label className={labelCls}>Platform</label>
                <select className={inputCls} value={platform} onChange={(e) => setPlatform(e.target.value as (typeof PLATFORMS)[number])}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className={labelCls}>Total Budget (₹) *</label><input type="number" className={inputCls} value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} required min={1} /></div>
              <div><label className={labelCls}>Creator Budget (₹)</label><input type="number" className={inputCls} value={creatorBudget} onChange={(e) => setCreatorBudget(e.target.value)} /></div>
              <div><label className={labelCls}>Platform Fee (₹)</label><input type="number" className={inputCls} value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Targeting & Deliverables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className={labelCls}>Locality (comma-separated)</label><input className={inputCls} value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Delhi, Mumbai" /></div>
              <div><label className={labelCls}>Languages (comma-separated)</label><input className={inputCls} value={languages} onChange={(e) => setLanguages(e.target.value)} /></div>
              <div><label className={labelCls}>Min Followers</label><input type="number" className={inputCls} value={minimumFollowers} onChange={(e) => setMinimumFollowers(e.target.value)} /></div>
              <div><label className={labelCls}>Max Followers</label><input type="number" className={inputCls} value={maximumFollowers} onChange={(e) => setMaximumFollowers(e.target.value)} /></div>
              <div><label className={labelCls}>Min Engagement Rate (%)</label><input type="number" step="0.1" className={inputCls} value={minimumEngagementRate} onChange={(e) => setMinimumEngagementRate(e.target.value)} /></div>
              <div><label className={labelCls}>Posts / Reels / Stories / Videos</label>
                <div className="grid grid-cols-4 gap-1">
                  <input type="number" placeholder="Posts" className={inputCls} value={numberOfPosts} onChange={(e) => setNumberOfPosts(e.target.value)} />
                  <input type="number" placeholder="Reels" className={inputCls} value={numberOfReels} onChange={(e) => setNumberOfReels(e.target.value)} />
                  <input type="number" placeholder="Stories" className={inputCls} value={numberOfStories} onChange={(e) => setNumberOfStories(e.target.value)} />
                  <input type="number" placeholder="Videos" className={inputCls} value={numberOfVideos} onChange={(e) => setNumberOfVideos(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-2"><label className={labelCls}>Custom Deliverables (one per line)</label><textarea className={`${inputCls} resize-none`} rows={2} value={customDeliverables} onChange={(e) => setCustomDeliverables(e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className={labelCls}>Start Date</label><input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div><label className={labelCls}>End Date</label><input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <div><label className={labelCls}>Application Deadline *</label><input type="date" className={inputCls} value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Attachments (URLs)</h3>
            <div className="space-y-3">
              <div><label className={labelCls}>Campaign Brief URL</label><input className={inputCls} value={campaignBrief} onChange={(e) => setCampaignBrief(e.target.value)} placeholder="https://" /></div>
              <div><label className={labelCls}>Reference Files (one URL per line)</label><textarea className={`${inputCls} resize-none`} rows={2} value={referenceFiles} onChange={(e) => setReferenceFiles(e.target.value)} /></div>
              <div><label className={labelCls}>Brand Assets (one URL per line)</label><textarea className={`${inputCls} resize-none`} rows={2} value={brandAssets} onChange={(e) => setBrandAssets(e.target.value)} /></div>
            </div>
          </section>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
