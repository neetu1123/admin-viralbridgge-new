'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import CreateCampaignForm, { type CampaignForm } from '../../components/CreateCampaignForm';

export default function CreateCampaignPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(Boolean(editId));
  const [defaults, setDefaults] = useState<Partial<CampaignForm>>({});
  const [deliverables, setDeliverables] = useState<string[]>(['1 Feed Post', '2 Stories']);

  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    brandApi
      .getCampaign(editId)
      .then((raw) => {
        const c = raw as Record<string, unknown>;
        setDefaults({
          title: String(c.title ?? ''),
          platform: String(c.platform ?? ''),
          niche: String(c.locality ?? c.niche ?? ''),
          budget: String(c.budget ?? ''),
          deadline: String(c.deadline ?? '').slice(0, 10),
          description: String(c.description ?? ''),
          followersMin: c.followers_min != null ? String(c.followers_min) : '',
          engagementMin: c.engagement_min != null ? String(c.engagement_min) : '',
        });
        setDeliverables(Array.isArray(c.deliverables) ? (c.deliverables as string[]) : ['1 Feed Post', '2 Stories']);
      })
      .catch(() => toast.error('Failed to load draft campaign'))
      .finally(() => setLoading(false));
  }, [editId]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" richColors />

      <Link
        href="/brand-my-campaigns"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Campaigns
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {editId ? 'Edit Campaign Draft' : 'Create New Campaign'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {editId
            ? 'Update your draft and publish when ready, or keep editing.'
            : 'Set up your campaign details. Save as draft to finish later, or publish to go live.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-violet-600" size={28} />
          </div>
        ) : (
          <CreateCampaignForm
            campaignId={editId ?? undefined}
            defaultValues={defaults}
            initialDeliverables={deliverables}
            onCancel={() => router.push('/brand-my-campaigns')}
            onSuccess={() => {
              toast.success(editId ? 'Campaign updated!' : 'Campaign saved!');
              router.push('/brand-my-campaigns');
            }}
            onError={(message) => toast.error(message)}
            submitLabel={editId ? 'Publish Campaign' : 'Publish Campaign'}
          />
        )}
      </div>
    </div>
  );
}
