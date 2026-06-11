'use client';
import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { brandApi, creatorApi } from '@/src/lib/api';

const QUICK_REASONS_BRAND = [
  'Deliverable did not meet brief requirements',
  'Creator submitted content late',
  'Creator withdrew from campaign mid-way',
];

const QUICK_REASONS_CREATOR = [
  'Payment not released after approved deliverable',
  'Brand changed requirements after submission',
  'Brand delayed payment release beyond agreed timeline',
];

export interface OpenDisputeModalProps {
  open: boolean;
  onClose: () => void;
  role: 'brand' | 'creator';
  campaignId: string;
  campaignTitle: string;
  creatorId?: string;
  creatorName?: string;
  amount?: number;
  escrowStatus?: string;
  onSuccess?: () => void;
}

export default function OpenDisputeModal({
  open,
  onClose,
  role,
  campaignId,
  campaignTitle,
  creatorId,
  creatorName,
  amount,
  escrowStatus,
  onSuccess,
}: OpenDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const quickReasons = role === 'brand' ? QUICK_REASONS_BRAND : QUICK_REASONS_CREATOR;

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      toast.error('Please provide a reason (at least 10 characters)');
      return;
    }
    if (role === 'brand' && !creatorId) {
      toast.error('Creator is required to open a dispute');
      return;
    }
    if (!campaignId) {
      toast.error('Campaign is required');
      return;
    }

    setSubmitting(true);
    try {
      if (role === 'brand') {
        await brandApi.openDispute({
          campaign_id: campaignId,
          creator_id: creatorId!,
          reason: reason.trim(),
        });
      } else {
        await creatorApi.openDispute({
          campaign_id: campaignId,
          reason: reason.trim(),
        });
      }
      toast.success('Dispute submitted — admin will review shortly');
      setReason('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-800 mb-1">Raise an Issue</h3>
        <p className="text-sm text-slate-500 mb-1">{campaignTitle}</p>
        {creatorName && role === 'brand' && (
          <p className="text-xs text-slate-400 mb-3">Creator: {creatorName}</p>
        )}
        {amount != null && (
          <p className="text-sm font-semibold text-slate-700 mb-3">
            ₹{amount.toLocaleString()} at stake
            {escrowStatus && (
              <span className="ml-2 text-xs font-normal text-slate-400">({escrowStatus})</span>
            )}
          </p>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Opening a dispute freezes escrow funds until an admin resolves the case. This cannot be undone.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickReasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 text-slate-600 hover:text-violet-700 border border-slate-200 transition-colors"
            >
              {r.length > 40 ? `${r.slice(0, 40)}…` : r}
            </button>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue in detail (min 10 characters)..."
          rows={4}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  );
}
