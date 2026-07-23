'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import { creatorApi } from '@/src/lib/api';
import { mapCreatorApplication } from '@/src/lib/mappers';

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border border-violet-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: 'Not Selected', cls: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

export default function ApplicationDetailContent({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [app, setApp] = useState<ReturnType<typeof mapCreatorApplication> | null>(null);

  const loadApplication = useCallback(async () => {
    setLoading(true);
    try {
      const raw = (await creatorApi.getApplication(applicationId)) as Record<string, unknown>;
      setApp(mapCreatorApplication(raw));
      setApplicationMessage(String(raw.message ?? ''));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleWithdraw = async () => {
    if (!confirm('Withdraw this application? You can apply again later if the campaign is still open.')) return;
    setWithdrawing(true);
    try {
      await creatorApi.withdrawApplication(applicationId);
      toast.success('Application withdrawn');
      router.push('/my-applications');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Application not found</p>
        <Link href="/my-applications" className="text-violet-600 font-semibold text-sm">
          Back to My Applications
        </Link>
      </div>
    );
  }

  const sConfig = statusConfig[app.status];

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />

      <Link
        href="/my-applications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-4"
      >
        <ArrowLeft size={14} /> Back to My Applications
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">{app.campaignTitle}</h1>
              <p className="text-sm text-slate-500 mt-1">{app.brand}</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${sConfig.cls}`}>
              {app.status === 'approved' ? <CheckCircle size={11} /> : app.status === 'rejected' ? <XCircle size={11} /> : <Clock size={11} />}
              {sConfig.label}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <PlatformBadge platform={app.platform} />
            <span className="text-sm font-semibold text-emerald-700">₹{app.budget.toLocaleString()}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> Deadline: {app.deadline || '—'}
            </span>
            <span className="text-xs text-slate-400">Applied: {app.appliedAt}</span>
          </div>

          {app.deliverables.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Deliverables</p>
              <div className="flex flex-wrap gap-1.5">
                {app.deliverables.map((d) => (
                  <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {applicationMessage && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Application Message</p>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">{applicationMessage}</p>
            </div>
          )}

          {app.status === 'rejected' && app.feedback && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Rejection Reason</p>
              <p className="text-sm text-red-800">{app.feedback}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            {app.status === 'approved' && (
              <Link
                href="/creator-deliverables"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
              >
                <Briefcase size={14} /> Upload Deliverables
              </Link>
            )}
            {['pending', 'shortlisted'].includes(app.status) && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50"
              >
                <Trash2 size={14} /> {withdrawing ? 'Withdrawing…' : 'Withdraw Application'}
              </button>
            )}
            <Link
              href={`/campaign-discovery?apply=${app.campaignId}`}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg"
            >
              View Campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
