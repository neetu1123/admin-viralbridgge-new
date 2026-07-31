'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { brandApi, creatorApi } from '@/src/lib/api';
import { extractList, mapBrandCampaign, mapCreatorApplication } from '@/src/lib/mappers';

const QUICK_REASONS_BRAND = [
  'Deliverable did not meet brief requirements',
  'Creator submitted content late',
  'Creator withdrew from campaign mid-way',
  'Payment or escrow issue',
];

const QUICK_REASONS_CREATOR = [
  'Payment not released after approved deliverable',
  'Brand changed requirements after submission',
  'Brand delayed payment release beyond agreed timeline',
  'Communication or scope issue',
];

const ISSUE_TYPES = [
  { value: 'campaign', label: 'Campaign issue' },
  { value: 'deliverable', label: 'Deliverable issue' },
  { value: 'payment', label: 'Payment / escrow issue' },
  { value: 'communication', label: 'Communication issue' },
  { value: 'other', label: 'Other issue' },
];

type CampaignOption = { id: string; title: string };
type CreatorOption = { id: string; name: string };

export interface OpenDisputeModalProps {
  open: boolean;
  onClose: () => void;
  role: 'brand' | 'creator';
  campaignId?: string;
  campaignTitle?: string;
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
  campaignId: initialCampaignId = '',
  campaignTitle: initialCampaignTitle = '',
  creatorId: initialCreatorId,
  creatorName: initialCreatorName,
  amount,
  escrowStatus,
  onSuccess,
}: OpenDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [issueType, setIssueType] = useState('campaign');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [creators, setCreators] = useState<CreatorOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [selectedCreatorId, setSelectedCreatorId] = useState(initialCreatorId ?? '');
  const [selectedCampaignTitle, setSelectedCampaignTitle] = useState(initialCampaignTitle);

  const isStandalone = !initialCampaignId;

  const loadBrandCreators = useCallback(async (campId: string) => {
    if (!campId) {
      setCreators([]);
      return;
    }
    try {
      const res = await brandApi.getMyCreators({ limit: 100 });
      const apps = extractList<Record<string, unknown>>(res);
      const options: CreatorOption[] = [];
      for (const row of apps) {
        const appCampaignId = String(
          (row.campaign as Record<string, unknown>)?.id ?? row.campaign_id ?? '',
        );
        if (appCampaignId && appCampaignId !== campId) continue;
        const creator = (row.creator as Record<string, unknown>) ?? row;
        const id = String(creator.id ?? row.creator_id ?? '');
        const user = (creator.user as Record<string, unknown>) ?? {};
        const name = String(creator.full_name ?? user.name ?? 'Creator');
        if (id && !options.some((o) => o.id === id)) {
          options.push({ id, name });
        }
      }
      if (options.length === 0) {
        const campRes = await brandApi.getCampaigns({ limit: 100 });
        const camp = extractList<Record<string, unknown>>(campRes).find((c) => String(c.id) === campId);
        const applications = (camp?.applications as Record<string, unknown>[]) ?? [];
        for (const app of applications) {
          const creator = (app.creator as Record<string, unknown>) ?? {};
          const id = String(creator.id ?? app.creator_id ?? '');
          const user = (creator.user as Record<string, unknown>) ?? {};
          const name = String(creator.full_name ?? user.name ?? app.creator_name ?? 'Creator');
          if (id && !options.some((o) => o.id === id)) {
            options.push({ id, name });
          }
        }
      }
      setCreators(options);
      if (options.length === 1) setSelectedCreatorId(options[0].id);
    } catch {
      setCreators([]);
    }
  }, []);

  const loadOptions = useCallback(async () => {
    if (!open || !isStandalone) return;
    setLoadingOptions(true);
    try {
      if (role === 'brand') {
        const res = await brandApi.getCampaigns({ limit: 100 });
        const list = extractList<Record<string, unknown>>(res).map(mapBrandCampaign);
        setCampaigns(list.map((c) => ({ id: c.id, title: c.title })));
        if (list[0] && !selectedCampaignId) {
          setSelectedCampaignId(list[0].id);
          setSelectedCampaignTitle(list[0].title);
          await loadBrandCreators(list[0].id);
        }
      } else {
        const res = await creatorApi.getApplications({ limit: 100 });
        const apps = extractList<Record<string, unknown>>(res).map(mapCreatorApplication);
        const unique = new Map<string, CampaignOption>();
        for (const app of apps) {
          if (app.campaignId) unique.set(app.campaignId, { id: app.campaignId, title: app.campaignTitle });
        }
        setCampaigns(Array.from(unique.values()));
        if (unique.size > 0 && !selectedCampaignId) {
          const first = Array.from(unique.values())[0];
          setSelectedCampaignId(first.id);
          setSelectedCampaignTitle(first.title);
        }
      }
    } catch {
      toast.error('Failed to load campaigns for dispute');
    } finally {
      setLoadingOptions(false);
    }
  }, [open, isStandalone, role, selectedCampaignId, loadBrandCreators]);

  useEffect(() => {
    if (open) {
      setSelectedCampaignId(initialCampaignId);
      setSelectedCampaignTitle(initialCampaignTitle);
      setSelectedCreatorId(initialCreatorId ?? '');
      setReason('');
      setIssueType('campaign');
    }
  }, [open, initialCampaignId, initialCampaignTitle, initialCreatorId]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (role === 'brand' && isStandalone && selectedCampaignId) {
      void loadBrandCreators(selectedCampaignId);
      const match = campaigns.find((c) => c.id === selectedCampaignId);
      if (match) setSelectedCampaignTitle(match.title);
    }
  }, [selectedCampaignId, role, isStandalone, loadBrandCreators, campaigns]);

  if (!open) return null;

  const quickReasons = role === 'brand' ? QUICK_REASONS_BRAND : QUICK_REASONS_CREATOR;
  const campaignId = selectedCampaignId || initialCampaignId;
  const campaignTitle = selectedCampaignTitle || initialCampaignTitle;
  const creatorId = selectedCreatorId || initialCreatorId;
  const creatorName = creators.find((c) => c.id === creatorId)?.name ?? initialCreatorName;

  const handleSubmit = async () => {
    if (!campaignId) {
      toast.error('Please select a campaign');
      return;
    }
    if (role === 'brand' && !creatorId) {
      toast.error('Please select the creator involved in this dispute');
      return;
    }
    if (reason.trim().length < 10) {
      toast.error('Please describe the issue (at least 10 characters)');
      return;
    }

    const issueLabel = ISSUE_TYPES.find((t) => t.value === issueType)?.label ?? issueType;
    const fullReason = `[${issueLabel}] ${reason.trim()}`;

    setSubmitting(true);
    try {
      if (role === 'brand') {
        await brandApi.openDispute({
          campaign_id: campaignId,
          creator_id: creatorId!,
          reason: fullReason,
        });
      } else {
        await creatorApi.openDispute({
          campaign_id: campaignId,
          reason: fullReason,
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-800 mb-1">Raise an Issue</h3>
        <p className="text-sm text-slate-500 mb-4">
          {isStandalone
            ? 'Select the campaign and describe your issue. Admin will review and resolve.'
            : campaignTitle}
        </p>

        {isStandalone && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue type</label>
              <div className="relative mt-1">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</label>
              {loadingOptions ? (
                <p className="text-sm text-slate-400 mt-2">Loading campaigns...</p>
              ) : (
                <div className="relative mt-1">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      setSelectedCampaignId(e.target.value);
                      setSelectedCreatorId('');
                      const match = campaigns.find((c) => c.id === e.target.value);
                      setSelectedCampaignTitle(match?.title ?? '');
                    }}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>

            {role === 'brand' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Creator involved</label>
                <div className="relative mt-1">
                  <select
                    value={selectedCreatorId}
                    onChange={(e) => setSelectedCreatorId(e.target.value)}
                    disabled={!selectedCampaignId || creators.length === 0}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedCampaignId
                        ? 'Select a campaign first'
                        : creators.length === 0
                          ? 'No creators found for this campaign'
                          : 'Select a creator'}
                    </option>
                    {creators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {!isStandalone && creatorName && role === 'brand' && (
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
            Opening a dispute freezes escrow funds until an admin resolves the case. Provide as much detail as possible.
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

// formatHandle export removed — helper lives in creator profile only
