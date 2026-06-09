'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/src/lib/api';

const STATIC_SETTINGS = [
  { title: 'Platform Fee', desc: 'Current fee rate applied to all transactions', value: '5%', action: 'Edit' as const },
  { title: 'Escrow Hold Period', desc: 'Days funds are held before auto-release', value: '14 days', action: 'Edit' as const },
  { title: 'KYC Required', desc: 'Require KYC verification before first payout', value: 'Enabled', action: 'Toggle' as const },
];

export default function AdminSettingsContent() {
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setAiMatchingEnabled(data.aiMatchingEnabled);
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
        {STATIC_SETTINGS.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{s.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-violet-700">{s.value}</span>
              <button className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                {s.action}
              </button>
            </div>
          </div>
        ))}

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
