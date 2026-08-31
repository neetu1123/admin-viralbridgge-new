'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { kycApi } from '@/src/lib/api';

type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

const statusConfig: Record<KycStatus, { label: string; color: string; icon: React.ElementType }> = {
  UNVERIFIED: { label: 'Not submitted', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: ShieldCheck },
  PENDING: { label: 'Under review', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  VERIFIED: { label: 'Verified', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected — resubmit', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
};

interface KycVerificationPanelProps {
  role: 'creator' | 'brand';
}

export default function KycVerificationPanel({ role }: KycVerificationPanelProps) {
  const [status, setStatus] = useState<KycStatus>('UNVERIFIED');
  const [remarks, setRemarks] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [creatorForm, setCreatorForm] = useState({
    mobile_number: '',
    instagram_handle: '',
    youtube_handle: '',
    tiktok_handle: '',
    instagram_profile_url: '',
    selfie_url: '',
    followers_count: '',
    engagement_rate: '',
    email_verified: false,
    mobile_verified: false,
  });

  const [brandForm, setBrandForm] = useState({
    company_name: '',
    gst_number: '',
    website: '',
    business_email: '',
    linkedin_url: '',
    logo_url: '',
    business_address: '',
    business_email_verified: false,
  });

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await kycApi.getStatus()) as {
        status?: string;
        latestRequest?: { status?: string; remarks?: string | null };
        creatorKyc?: Record<string, unknown>;
        brandKyc?: Record<string, unknown>;
      };
      const s = (res.status ?? 'UNVERIFIED') as KycStatus;
      setStatus(s);
      setRemarks(res.latestRequest?.remarks ?? null);

      if (res.creatorKyc) {
        const c = res.creatorKyc;
        setCreatorForm({
          mobile_number: String(c.mobile_number ?? ''),
          instagram_handle: String(c.instagram_handle ?? ''),
          youtube_handle: String(c.youtube_handle ?? ''),
          tiktok_handle: String(c.tiktok_handle ?? ''),
          instagram_profile_url: String(c.instagram_profile_url ?? ''),
          selfie_url: String(c.selfie_url ?? ''),
          followers_count: c.followers_count != null ? String(c.followers_count) : '',
          engagement_rate: c.engagement_rate != null ? String(c.engagement_rate) : '',
          email_verified: Boolean(c.email_verified),
          mobile_verified: Boolean(c.mobile_verified),
        });
      }

      if (res.brandKyc) {
        const b = res.brandKyc;
        setBrandForm({
          company_name: String(b.company_name ?? ''),
          gst_number: String(b.gst_number ?? ''),
          website: String(b.website ?? ''),
          business_email: String(b.business_email ?? ''),
          linkedin_url: String(b.linkedin_url ?? ''),
          logo_url: String(b.logo_url ?? ''),
          business_address: String(b.business_address ?? ''),
          business_email_verified: Boolean(b.business_email_verified),
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const canSubmit = status === 'UNVERIFIED' || status === 'REJECTED';
  const cfg = statusConfig[status] ?? statusConfig.UNVERIFIED;
  const StatusIcon = cfg.icon;

  const submitCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorForm.instagram_handle.trim() || !creatorForm.selfie_url.trim()) {
      toast.error('Instagram handle and selfie URL are required');
      return;
    }
    setSubmitting(true);
    try {
      await kycApi.submitCreator({
        ...creatorForm,
        followers_count: Number(creatorForm.followers_count) || 0,
        engagement_rate: Number(creatorForm.engagement_rate) || 0,
      });
      toast.success('KYC submitted for review');
      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.company_name.trim() || !brandForm.business_email.trim() || !brandForm.website.trim()) {
      toast.error('Company name, business email, and website are required');
      return;
    }
    setSubmitting(true);
    try {
      await kycApi.submitBrand(brandForm);
      toast.success('KYC submitted for review');
      await loadStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Identity Verification</h2>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'creator'
              ? 'Verify your social profiles and identity to unlock payments and campaigns.'
              : 'Verify your business details to run campaigns and manage payouts.'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
          <StatusIcon size={13} />
          {cfg.label}
        </span>
      </div>

      {status === 'PENDING' && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Your submission is being reviewed. You will be notified once a decision is made.
        </div>
      )}

      {status === 'VERIFIED' && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
          Your account is verified. All platform features are unlocked.
        </div>
      )}

      {status === 'REJECTED' && remarks && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          <strong>Rejection reason:</strong> {remarks}
        </div>
      )}

      {role === 'creator' ? (
        <form onSubmit={submitCreator} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Instagram Handle *" value={creatorForm.instagram_handle} onChange={(v) => setCreatorForm((f) => ({ ...f, instagram_handle: v }))} disabled={!canSubmit} placeholder="@username" />
            <Field label="Mobile Number" value={creatorForm.mobile_number} onChange={(v) => setCreatorForm((f) => ({ ...f, mobile_number: v }))} disabled={!canSubmit} />
            <Field label="YouTube Handle" value={creatorForm.youtube_handle} onChange={(v) => setCreatorForm((f) => ({ ...f, youtube_handle: v }))} disabled={!canSubmit} />
            <Field label="TikTok Handle" value={creatorForm.tiktok_handle} onChange={(v) => setCreatorForm((f) => ({ ...f, tiktok_handle: v }))} disabled={!canSubmit} />
            <Field label="Instagram Profile URL" value={creatorForm.instagram_profile_url} onChange={(v) => setCreatorForm((f) => ({ ...f, instagram_profile_url: v }))} disabled={!canSubmit} />
            <Field label="Selfie URL *" value={creatorForm.selfie_url} onChange={(v) => setCreatorForm((f) => ({ ...f, selfie_url: v }))} disabled={!canSubmit} placeholder="https://..." />
            <Field label="Followers Count" value={creatorForm.followers_count} onChange={(v) => setCreatorForm((f) => ({ ...f, followers_count: v }))} disabled={!canSubmit} type="number" />
            <Field label="Engagement Rate (%)" value={creatorForm.engagement_rate} onChange={(v) => setCreatorForm((f) => ({ ...f, engagement_rate: v }))} disabled={!canSubmit} type="number" />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <Checkbox label="Email verified" checked={creatorForm.email_verified} onChange={(v) => setCreatorForm((f) => ({ ...f, email_verified: v }))} disabled={!canSubmit} />
            <Checkbox label="Mobile verified" checked={creatorForm.mobile_verified} onChange={(v) => setCreatorForm((f) => ({ ...f, mobile_verified: v }))} disabled={!canSubmit} />
          </div>
          {canSubmit && (
            <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Submit for Verification
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={submitBrand} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name *" value={brandForm.company_name} onChange={(v) => setBrandForm((f) => ({ ...f, company_name: v }))} disabled={!canSubmit} />
            <Field label="Business Email *" value={brandForm.business_email} onChange={(v) => setBrandForm((f) => ({ ...f, business_email: v }))} disabled={!canSubmit} type="email" />
            <Field label="Website *" value={brandForm.website} onChange={(v) => setBrandForm((f) => ({ ...f, website: v }))} disabled={!canSubmit} placeholder="https://..." />
            <Field label="GST Number" value={brandForm.gst_number} onChange={(v) => setBrandForm((f) => ({ ...f, gst_number: v }))} disabled={!canSubmit} />
            <Field label="LinkedIn URL" value={brandForm.linkedin_url} onChange={(v) => setBrandForm((f) => ({ ...f, linkedin_url: v }))} disabled={!canSubmit} />
            <Field label="Logo URL" value={brandForm.logo_url} onChange={(v) => setBrandForm((f) => ({ ...f, logo_url: v }))} disabled={!canSubmit} />
            <div className="md:col-span-2">
              <Field label="Business Address" value={brandForm.business_address} onChange={(v) => setBrandForm((f) => ({ ...f, business_address: v }))} disabled={!canSubmit} />
            </div>
          </div>
          <Checkbox label="Business email verified" checked={brandForm.business_email_verified} onChange={(v) => setBrandForm((f) => ({ ...f, business_email_verified: v }))} disabled={!canSubmit} />
          {canSubmit && (
            <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Submit for Verification
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
      {label}
    </label>
  );
}
