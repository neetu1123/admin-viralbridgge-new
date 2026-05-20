'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, Send } from 'lucide-react';
import Modal from '@/src/components/ui/Modal';


interface ApplyForm {
  message: string;
  proposedPrice: string;
}

interface Campaign {
  id: string;
  title: string;
  brand: string;
  brandLogo: string;
  platform: string;
  budget: number;
  budgetPer: string;
  deliverables: string[];
}

interface ApplyModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ campaign, onClose, onSuccess }: ApplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ApplyForm>();

  const onSubmit = async (data: ApplyForm) => {
    setIsSubmitting(true);
    // BACKEND: POST /api/applications { campaignId: campaign.id, message: data.message, proposedPrice: data.proposedPrice }
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Modal open onClose={onClose} title={`Apply to Campaign`} size="md">
      {/* Campaign summary */}
      <div className="bg-violet-50 rounded-lg p-3 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-violet-700 text-xs font-bold">{campaign.brandLogo}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{campaign.title}</p>
          <p className="text-xs text-slate-500">{campaign.brand}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-emerald-700">${campaign.budget.toLocaleString()}</p>
          <p className="text-xs text-slate-400">{campaign.budgetPer}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="apply-message">
            Application Message
          </label>
          <p className="text-xs text-slate-400 mb-1.5">Tell the brand why you are the right fit for this campaign</p>
          <textarea
            id="apply-message"
            rows={4}
            placeholder="Hi! I'm a beauty and wellness creator with 45K engaged followers. I've worked with 12+ skincare brands and consistently deliver authentic, high-converting content..."
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none transition-colors ${errors.message ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
            {...register('message', { required: 'Application message is required', minLength: { value: 50, message: 'Write at least 50 characters to stand out' } })}
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="apply-price">
            Proposed Price (Optional)
          </label>
          <p className="text-xs text-slate-400 mb-1.5">Leave blank to accept the listed rate of ${campaign.budget.toLocaleString()}</p>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="apply-price"
              type="number"
              placeholder={campaign.budget.toString()}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              {...register('proposedPrice', {
                min: { value: 50, message: 'Minimum proposed price is $50' },
                max: { value: 50000, message: 'Maximum proposed price is $50,000' },
              })}
            />
          </div>
          {errors.proposedPrice && <p className="text-red-500 text-xs mt-1">{errors.proposedPrice.message}</p>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg text-sm transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Submitting...</span></>
            ) : (
              <><Send size={14} /><span>Submit Application</span></>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}