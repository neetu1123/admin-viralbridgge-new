'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Modal from '@/src/components/ui/Modal';
import { Plus, X } from 'lucide-react';

interface CampaignForm {
  title: string;
  platform: string;
  niche: string;
  budget: string;
  deadline: string;
  description: string;
  followersMin: string;
  engagementMin: string;
}

interface CreateCampaignModalProps {
  onClose: () => void;
}

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Pinterest', 'Twitch'];
const niches = ['Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing'];

export default function CreateCampaignModal({ onClose }: CreateCampaignModalProps) {
  const [deliverables, setDeliverables] = useState<string[]>(['1 Feed Post', '2 Stories']);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CampaignForm>();

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables(prev => [...prev, newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const onSubmit = async (data: CampaignForm) => {
    setIsSubmitting(true);
    // BACKEND: POST /api/campaigns { ...data, deliverables }
    await new Promise(r => setTimeout(r, 1200));
    setIsSubmitting(false);
    toast.success('Campaign created successfully!');
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Create New Campaign" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-title">Campaign Title</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-platform">Platform</label>
            <select
              id="camp-platform"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.platform ? 'border-red-400' : 'border-slate-200'}`}
              {...register('platform', { required: 'Select a platform' })}
            >
              <option value="">Select platform...</option>
              {platforms.map(p => <option key={`cp-${p}`} value={p}>{p}</option>)}
            </select>
            {errors.platform && <p className="text-red-500 text-xs mt-1">{errors.platform.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-niche">Niche</label>
            <select
              id="camp-niche"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.niche ? 'border-red-400' : 'border-slate-200'}`}
              {...register('niche', { required: 'Select a niche' })}
            >
              <option value="">Select niche...</option>
              {niches.map(n => <option key={`cn-${n}`} value={n}>{n}</option>)}
            </select>
            {errors.niche && <p className="text-red-500 text-xs mt-1">{errors.niche.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-budget">Total Budget ($)</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-deadline">Application Deadline</label>
            <input
              id="camp-deadline"
              type="date"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              {...register('deadline', { required: 'Deadline is required' })}
            />
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-followers">Min. Followers</label>
            <input
              id="camp-followers"
              type="number"
              placeholder="10000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              {...register('followersMin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-engagement">Min. Engagement Rate (%)</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="camp-desc">Campaign Description</label>
            <p className="text-xs text-slate-400 mb-1.5">Describe what you want creators to do and what content you are looking for</p>
            <textarea
              id="camp-desc"
              rows={3}
              placeholder="We are launching our new product and need authentic creators to showcase it to their audience..."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              {...register('description', { required: 'Description is required', minLength: { value: 30, message: 'Add at least 30 characters' } })}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deliverables</label>
            <p className="text-xs text-slate-400 mb-2">What content do you expect from creators?</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {deliverables.map((d, i) => (
                <span key={`deliv-${i}`} className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 text-xs font-medium px-2.5 py-1 rounded-full">
                  {d}
                  <button type="button" onClick={() => setDeliverables(prev => prev.filter((_, j) => j !== i))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={e => setNewDeliverable(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                placeholder="e.g. 1 Instagram Reel"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <button type="button" onClick={addDeliverable} className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating...</span></>
            ) : (
              'Create Campaign'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}