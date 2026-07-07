'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/src/lib/api';

export default function AdminSettingsContent() {
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);
  const [platformFeePercent, setPlatformFeePercent] = useState(10);
  const [feeInput, setFeeInput] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFee, setSavingFee] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setAiMatchingEnabled(data.aiMatchingEnabled);
      const fee = data.platformFeePercent ?? 10;
      setPlatformFeePercent(fee);
      setFeeInput(String(fee));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleAiToggle = async () => {
    const next = !aiMatchingEnabled;
    setSaving(true);
    try {
      const data = await adminApi.patchSettings({ aiMatchingEnabled: next });
      setAiMatchingEnabled(data.aiMatchingEnabled);
      toast.success(`AI Matching ${data.aiMatchingEnabled ? 'enabled' : 'disabled'}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update AI Matching');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFee = async () => {
    const next = Number(feeInput);
    if (!Number.isFinite(next) || next < 0 || next > 50) {
      toast.error('Platform fee must be between 0 and 50');
      return;
    }
    setSavingFee(true);
    try {
      const data = await adminApi.patchSettings({ platformFeePercent: next });
      setPlatformFeePercent(data.platformFeePercent ?? next);
      setFeeInput(String(data.platformFeePercent ?? next));
      toast.success(`Platform fee updated to ${data.platformFeePercent ?? next}%`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update platform fee');
    } finally {
      setSavingFee(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Platform configuration and admin preferences</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Platform Fee</p>
              <p className="text-xs text-slate-500 mt-0.5">Fee rate applied to all escrow transactions</p>
            </div>
            <span className="text-sm font-bold text-violet-700">{platformFeePercent}%</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
            <button
              onClick={handleSaveFee}
              disabled={savingFee}
              className="text-xs px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {savingFee ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Escrow Hold Period</p>
            <p className="text-xs text-slate-500 mt-0.5">Auto-release after deliverable approval</p>
          </div>
          <span className="text-sm font-bold text-slate-700">7 days</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">KYC Required</p>
            <p className="text-xs text-slate-500 mt-0.5">Require KYC verification before first payout</p>
          </div>
          <span className="text-sm font-bold text-emerald-700">Enabled</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Matching</p>
            <p className="text-xs text-slate-500 mt-0.5">Automatic creator-campaign matching engine</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${aiMatchingEnabled ? 'text-violet-700' : 'text-slate-500'}`}>
              {aiMatchingEnabled ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={handleAiToggle}
              disabled={saving}
              className={`relative rounded-full transition-colors flex-shrink-0 ${aiMatchingEnabled ? 'bg-violet-600' : 'bg-slate-200'} ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{ height: '22px', width: '40px' }}
              aria-label="Toggle AI Matching"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiMatchingEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
