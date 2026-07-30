'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { securityApi } from '@/src/lib/api';

const CLOSE_REASONS = [
  'Taking a break from the platform',
  'Switching to another platform',
  'Privacy concerns',
  'Not getting enough opportunities',
  'Other',
];

interface RequestCloseAccountPanelProps {
  roleLabel: 'Creator' | 'Brand';
}

export default function RequestCloseAccountPanel({ roleLabel }: RequestCloseAccountPanelProps) {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState(CLOSE_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      toast.error('Enter your password to submit the request');
      return;
    }
    const reasonText = reason === 'Other' ? details.trim() : reason;
    if (!reasonText) {
      toast.error('Please tell us why you want to close your account');
      return;
    }
    if (!confirm('Submit a request to close your account? Our team will review and contact you.')) return;

    setSubmitting(true);
    try {
      await securityApi.deactivateAccount(password, 'DELETE');
      toast.success('Account closure request submitted. Our team will review shortly.');
      setPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Request to Close Account</p>
      <p className="text-xs text-slate-500 mb-3">
        {roleLabel}s can request account closure here. Our admin team will review your request and follow up before any action is taken.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            {CLOSE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
          <input
            type="password"
            placeholder="Enter password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>
      {reason === 'Other' && (
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Please share more details..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
        />
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Request to Close Account'}
      </button>
    </div>
  );
}
