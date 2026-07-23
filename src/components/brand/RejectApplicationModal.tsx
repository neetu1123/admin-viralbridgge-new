'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const REJECT_REASONS = [
  'Profile does not match campaign requirements',
  'Insufficient audience reach for this campaign',
  'Content style not aligned with brand',
  'Campaign slots filled',
  'Other',
];

type Props = {
  open: boolean;
  creatorName?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export default function RejectApplicationModal({ open, creatorName, onClose, onConfirm }: Props) {
  const [reasonPreset, setReasonPreset] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const finalReason = reasonPreset === 'Other' ? customReason.trim() : reasonPreset;

  const handleSubmit = async () => {
    if (!finalReason) return;
    setSubmitting(true);
    try {
      await onConfirm(finalReason);
      setCustomReason('');
      setReasonPreset(REJECT_REASONS[0]);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Reject Application</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            {creatorName ? `Tell ${creatorName} why their application was not selected.` : 'Provide a reason for rejection.'}
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason</label>
            <select
              value={reasonPreset}
              onChange={(e) => setReasonPreset(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {reasonPreset === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Details</label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
                placeholder="Explain why you are rejecting this creator..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              />
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!finalReason || submitting}
            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Rejecting…' : 'Reject Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
