'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2, MessageSquare, UserCheck } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { mapBrandApplicant } from '@/src/lib/mappers';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import RejectApplicationModal from '@/src/components/brand/RejectApplicationModal';

export default function BrandApplicantDetailContent({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(true);
  const [showReject, setShowReject] = useState(false);
  const [applicant, setApplicant] = useState<ReturnType<typeof mapBrandApplicant> | null>(null);

  const loadApplicant = useCallback(async () => {
    setLoading(true);
    try {
      const raw = (await brandApi.getApplication(applicationId)) as Record<string, unknown>;
      const campaign = (raw.campaign as Record<string, unknown>) ?? {};
      setApplicant(mapBrandApplicant(raw, campaign));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load applicant');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplicant();
  }, [loadApplicant]);

  const handleAction = async (action: 'approve' | 'reject' | 'shortlist', reason?: string) => {
    try {
      if (action === 'shortlist') await brandApi.shortlistApplication(applicationId);
      else if (action === 'approve') await brandApi.approveApplication(applicationId);
      else await brandApi.rejectApplication(applicationId, reason ?? 'Not selected for this campaign');
      toast.success(`Application ${action === 'approve' ? 'approved' : action === 'shortlist' ? 'shortlisted' : 'rejected'}`);
      await loadApplicant();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Applicant not found</p>
        <Link href="/brand-applicant" className="text-violet-600 font-semibold text-sm">Back to Applicants</Link>
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />
      <Link href="/brand-applicant" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={14} /> Back to Applicants
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-violet-700 font-bold">{applicant.avatar}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{applicant.name}</h1>
            <p className="text-sm text-violet-600">{applicant.handle}</p>
            <p className="text-xs text-slate-500 mt-1">Applied to {applicant.campaign} · {applicant.appliedAt}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
          {applicant.bio || 'No application message provided.'}
        </p>

        <div className="flex flex-wrap gap-3 mb-5">
          <PlatformBadge platform={applicant.platform} />
          <span className="text-xs text-slate-600">{(applicant.followers / 1000).toFixed(1)}K followers</span>
          <span className="text-xs text-emerald-700">{applicant.engagementRate}% engagement</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {['pending', 'shortlisted'].includes(applicant.status) && (
            <>
              <button onClick={() => handleAction('shortlist')} className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-2 rounded-lg">Shortlist</button>
              <button onClick={() => handleAction('approve')} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"><UserCheck size={12} /> Approve</button>
              <button onClick={() => setShowReject(true)} className="text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg">Reject with Reason</button>
            </>
          )}
          {applicant.status === 'approved' && (
            <Link href="/brand-messages" className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-3 py-2 rounded-lg flex items-center gap-1">
              <MessageSquare size={12} /> Message Creator
            </Link>
          )}
        </div>
      </div>

      <RejectApplicationModal
        open={showReject}
        creatorName={applicant.name}
        onClose={() => setShowReject(false)}
        onConfirm={async (reason) => handleAction('reject', reason)}
      />
    </div>
  );
}
