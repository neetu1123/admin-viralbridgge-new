'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type RejectReasonModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export default function RejectReasonModal({
  open,
  title,
  description,
  confirmLabel = 'Reject and notify',
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason('');
    setError('');
    setSaving(false);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Tell them why this was rejected.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onConfirm(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the rejection');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor="rejection-reason">
            Rejection reason
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Explain what needs to change"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? 'Sending…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
