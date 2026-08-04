'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { brandApi } from '@/src/lib/api';

export interface CampaignForm {
  title: string;
  platform: string;
  niche: string;
  budget: string;
  deadline: string;
  description: string;
  followersMin: string;
  engagementMin: string;
}

interface CreateCampaignFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  cancelLabel?: string;
  submitLabel?: string;
  className?: string;
  campaignId?: string;
  initialDeliverables?: string[];
  defaultValues?: Partial<CampaignForm>;
}

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Pinterest', 'Twitch'];
const niches = [
  'Beauty & Skincare',
  'Fitness & Wellness',
  'Food & Cooking',
  'Tech & Gadgets',
  'Fashion & Style',
  'Travel & Adventure',
  'Gaming',
  'Finance & Investing',
];

export default function CreateCampaignForm({
  onCancel,
  onSuccess,
  onError,
  cancelLabel = 'Cancel',
  submitLabel = 'Publish Campaign',
  className = '',
  campaignId,
  initialDeliverables = ['1 Feed Post', '2 Stories'],
  defaultValues,
}: CreateCampaignFormProps) {
  const [deliverables, setDeliverables] = useState<string[]>(initialDeliverables);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const isEditing = Boolean(campaignId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CampaignForm>({
    defaultValues: defaultValues ?? {},
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
    setDeliverables(initialDeliverables);
  }, [defaultValues, initialDeliverables, reset]);

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables((prev) => [...prev, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const buildPayload = (data: CampaignForm, status: 'DRAFT' | 'PENDING_APPROVAL') => ({
    title: data.title,
    description: data.description,
    platform: data.platform,
    budget: Number(data.budget),
    deadline: data.deadline,
    deliverables,
    locality: data.niche,
    languages: ['English'],
    status,
    followers_min: data.followersMin ? Number(data.followersMin) : undefined,
    engagement_min: data.engagementMin ? Number(data.engagementMin) : undefined,
  });

  const saveCampaign = async (data: CampaignForm, status: 'DRAFT' | 'PENDING_APPROVAL', asDraft: boolean) => {
    if (asDraft) setSavingDraft(true);
    else setIsSubmitting(true);
    try {
      const payload = buildPayload(data, status);
      if (isEditing && campaignId) {
        await brandApi.updateCampaign(campaignId, payload);
      } else {
        await brandApi.createCampaign(payload);
      }
      onSuccess();
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : 'Failed to save campaign');
    } finally {
      setIsSubmitting(false);
      setSavingDraft(false);
    }
  };

  const onPublish = (data: CampaignForm) => saveCampaign(data, 'PENDING_APPROVAL', false);
  const onSaveDraft = (data: CampaignForm) => saveCampaign(data, 'DRAFT', true);

  return (
    <form onSubmit={handleSubmit(onPublish)} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-title">
            Campaign Title
          </label>
          <input
            id="camp-title"
            type="text"
            placeholder="Summer Glow Skincare Launch"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('title', { required: 'Campaign title is required' })}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-platform">
            Platform
          </label>
          <select
            id="camp-platform"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.platform ? 'border-red-400' : 'border-slate-200'}`}
            {...register('platform', { required: 'Select a platform' })}
          >
            <option value="">Select platform...</option>
            {platforms.map((p) => (
              <option key={`cp-${p}`} value={p}>{p}</option>
            ))}
          </select>
          {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-niche">
            Niche
          </label>
          <select
            id="camp-niche"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.niche ? 'border-red-400' : 'border-slate-200'}`}
            {...register('niche', { required: 'Select a niche' })}
          >
            <option value="">Select niche...</option>
            {niches.map((n) => (
              <option key={`cn-${n}`} value={n}>{n}</option>
            ))}
          </select>
          {errors.niche && <p className="text-red-500 text-xs mt-1">{errors.niche.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-budget">
            Total Budget ($)
          </label>
          <input
            id="camp-budget"
            type="number"
            placeholder="5000"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.budget ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('budget', { required: 'Budget is required', min: { value: 100, message: 'Minimum budget is $100' } })}
          />
          {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-deadline">
            Application Deadline
          </label>
          <input
            id="camp-deadline"
            type="date"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('deadline', { required: 'Deadline is required' })}
          />
          {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-followers">
            Min. Followers
          </label>
          <input
            id="camp-followers"
            type="number"
            placeholder="10000"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            {...register('followersMin')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-engagement">
            Min. Engagement Rate (%)
          </label>
          <input
            id="camp-engagement"
            type="number"
            step="0.1"
            placeholder="3.5"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            {...register('engagementMin')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-desc">
            Campaign Description
          </label>
          <textarea
            id="camp-desc"
            rows={4}
            placeholder="We are launching our new product and need authentic creators..."
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Add at least 30 characters' } })}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Deliverables</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {deliverables.map((d, i) => (
              <span
                key={`deliv-${i}`}
                className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {d}
                <button type="button" onClick={() => setDeliverables((prev) => prev.filter((_, j) => j !== i))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
              placeholder="e.g. 1 Instagram Reel"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={addDeliverable}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={savingDraft || isSubmitting}
          onClick={handleSubmit(onSaveDraft)}
          className="flex-1 py-2.5 border border-amber-200 bg-amber-50 text-amber-800 font-semibold rounded-lg text-sm hover:bg-amber-100 transition-colors disabled:opacity-70"
        >
          {savingDraft ? 'Saving draft...' : isEditing ? 'Update Draft' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || savingDraft}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-70"
        >
          {isSubmitting ? 'Publishing...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
