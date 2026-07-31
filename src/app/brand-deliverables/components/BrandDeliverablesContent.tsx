'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  CheckCircle2,
  RefreshCw,
  Loader2,
  Video,
  Image as ImageIcon,
  Lock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Download,
} from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList, mapBrandCampaign, type BrandCampaignRow } from '@/src/lib/mappers';
import { revisionsRemaining } from '@/src/lib/revisionLimits';

type DeliverableRow = {
  id: string;
  title: string;
  status: string;
  fileUrl?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  notes?: string | null;
  revisionNotes?: string | null;
  version?: number;
  submittedAt?: string | null;
  creatorId?: string;
  creator?: { full_name?: string; user?: { name?: string } };
};

type EscrowRow = {
  id: string;
  campaignId: string;
  creatorId: string;
  amount: number;
  platformFee: number;
  brandTotal: number;
  status: string;
  creatorName?: string;
};

type CampaignGroup = {
  campaign: BrandCampaignRow;
  deliverables: DeliverableRow[];
  escrows: EscrowRow[];
};

const PLATFORM_FEE_PERCENT = 10;

function escrowFundingTotals(campaignAmount: number) {
  const platformFee = Math.round((campaignAmount * PLATFORM_FEE_PERCENT) / 100 * 100) / 100;
  return { platformFee, brandTotal: campaignAmount + platformFee };
}

function normalizeDeliverable(raw: Record<string, unknown>): DeliverableRow {
  const creator = raw.creator as DeliverableRow['creator'];
  return {
    id: String(raw.id),
    title: String(raw.title ?? 'Deliverable'),
    status: String(raw.status ?? 'PENDING').toUpperCase(),
    fileUrl: (raw.fileUrl ?? raw.file_url ?? raw.mediaUrl ?? raw.media_url) as string | null,
    mediaUrl: (raw.mediaUrl ?? raw.media_url) as string | null,
    thumbnailUrl: (raw.thumbnailUrl ?? raw.thumbnail_url) as string | null,
    notes: (raw.notes as string) ?? null,
    revisionNotes: (raw.revisionNotes ?? raw.revision_notes) as string | null,
    version: Number(raw.version) || 1,
    submittedAt: (raw.submittedAt ?? raw.submitted_at) as string | null,
    creatorId: String(raw.creatorId ?? raw.creator_id ?? ''),
    creator,
  };
}

const statusLabel: Record<string, string> = {
  PENDING: 'Not submitted',
  SUBMITTED: 'Awaiting your review',
  IN_REVIEW: 'Awaiting your review',
  REVISION_REQUESTED: 'Revision sent',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

function isVideo(url?: string | null) {
  return Boolean(url && /\.(mp4|webm|mov)(\?|$)/i.test(url));
}

function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function BrandDeliverablesContent() {
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get('campaign');
  const [groups, setGroups] = useState<CampaignGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [actionId, setActionId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [brandPlan, setBrandPlan] = useState<string>('growth');

  useEffect(() => {
    brandApi.getSettings().then((s) => {
      const settings = s as { plan?: string; subscriptionPlan?: string };
      setBrandPlan(String(settings.plan ?? settings.subscriptionPlan ?? 'growth'));
    }).catch(() => {});
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignsRes, escrowRes] = await Promise.all([
        brandApi.getCampaigns({ limit: 50 }),
        brandApi.getEscrows(),
      ]);
      const campaignList = extractList<Record<string, unknown>>(campaignsRes).map(mapBrandCampaign);

      const allEscrows = (Array.isArray(escrowRes) ? escrowRes : []).map((e: Record<string, unknown>) => {
        const amount = Number(e.amount) || 0;
        const platformFee = Number(e.platformFee ?? e.platform_fee_amount ?? e.platform_fee) || escrowFundingTotals(amount).platformFee;
        const brandTotal = Number(e.brandTotal) || amount + platformFee;
        return {
          id: String(e.id),
          campaignId: String(e.campaignId ?? e.campaign_id),
          creatorId: String(e.creatorId ?? e.creator_id),
          amount,
          platformFee,
          brandTotal,
          status: String(e.status ?? '').toUpperCase(),
          creatorName: String(e.creatorName ?? ''),
        };
      });

      const loadedGroups: CampaignGroup[] = [];
      for (const campaign of campaignList) {
        try {
          const delRes = await brandApi.getCampaignDeliverables(campaign.id);
          const list = Array.isArray(delRes) ? delRes : [];
          const deliverables = list.map((d) => normalizeDeliverable(d as Record<string, unknown>));
          if (deliverables.length > 0 || allEscrows.some((e) => e.campaignId === campaign.id)) {
            loadedGroups.push({
              campaign,
              deliverables,
              escrows: allEscrows.filter((e) => e.campaignId === campaign.id),
            });
          }
        } catch {
          /* skip campaigns without deliverables access */
        }
      }

      setGroups(loadedGroups);
      const expandIds = new Set<string>();
      if (initialCampaignId && loadedGroups.some((g) => g.campaign.id === initialCampaignId)) {
        expandIds.add(initialCampaignId);
      } else if (loadedGroups[0]) {
        expandIds.add(loadedGroups[0].campaign.id);
      }
      setExpanded(expandIds);
    } catch {
      toast.error('Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  }, [initialCampaignId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const pendingEscrows = useMemo(
    () => groups.flatMap((g) => g.escrows.filter((e) => e.status === 'PENDING')),
    [groups],
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fundEscrow = async (escrow: EscrowRow) => {
    setActionId(escrow.id);
    try {
      await brandApi.fundEscrow({
        campaign_id: escrow.campaignId,
        creator_id: escrow.creatorId,
        amount: escrow.amount,
      });
      toast.success('Escrow funded — creator can now upload');
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fund escrow');
    } finally {
      setActionId(null);
    }
  };

  const approve = async (id: string) => {
    setActionId(id);
    try {
      await brandApi.approveDeliverable(id);
      toast.success('Approved — payment releases when all items are approved');
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const revise = async (id: string, version: number) => {
    const notes = revisionNotes[id]?.trim();
    if (!notes) {
      toast.error('Add revision notes');
      return;
    }
    const remaining = revisionsRemaining(brandPlan, version);
    if (remaining <= 0) {
      toast.error('No revisions left on your plan for this deliverable');
      return;
    }
    setActionId(id);
    try {
      await brandApi.reviseDeliverable(id, notes);
      toast.success('Revision requested');
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Review Deliverables</h1>
        <p className="text-sm text-slate-500 mt-1">
          Campaign cards group all creator submissions. Expand a campaign to review, approve, or download files.
        </p>
      </div>

      {pendingEscrows.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            <Lock size={16} /> Escrow not funded yet
          </p>
          <p className="text-xs text-amber-800 mt-1 mb-3">
            Creators cannot upload until you deposit funds into escrow.
          </p>
          <div className="space-y-2">
            {pendingEscrows.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-amber-100">
                <div>
                  <span className="text-sm font-medium text-slate-800 block">{e.creatorName || 'Creator'}</span>
                  <span className="text-xs text-slate-500">
                    Campaign ₹{e.amount.toLocaleString()} + {PLATFORM_FEE_PERCENT}% fee ={' '}
                    <span className="font-semibold text-slate-700">₹{e.brandTotal.toLocaleString()} total</span>
                  </span>
                </div>
                <button
                  onClick={() => fundEscrow(e)}
                  disabled={actionId === e.id}
                  className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {actionId === e.id ? 'Funding...' : `Pay ₹${e.brandTotal.toLocaleString()}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading...
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
          No deliverables yet. Approve creators on your campaigns first.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ campaign, deliverables }) => {
            const isOpen = expanded.has(campaign.id);
            const submittedCount = deliverables.filter((d) => d.status !== 'PENDING').length;
            return (
              <div key={campaign.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(campaign.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={16} className="text-violet-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{campaign.title}</p>
                      <p className="text-xs text-slate-500">
                        {submittedCount} of {deliverables.length} submitted · {campaign.accepted} creator(s) approved
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {deliverables.map((del) => {
                      const previewUrl = del.fileUrl ?? del.mediaUrl;
                      const creatorName = del.creator?.full_name ?? del.creator?.user?.name ?? 'Creator';
                      const reviewable = ['SUBMITTED', 'IN_REVIEW'].includes(del.status);
                      const remainingRevisions = revisionsRemaining(brandPlan, del.version ?? 1);
                      const ext = previewUrl?.split('.').pop()?.split('?')[0] ?? 'file';

                      return (
                        <div key={del.id} className="p-5">
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                              <h3 className="font-bold text-slate-800">{del.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">{creatorName} · v{del.version ?? 1}</p>
                              {del.notes && <p className="text-sm text-slate-600 mt-2">&quot;{del.notes}&quot;</p>}
                              {del.revisionNotes && (
                                <p className="text-xs text-amber-700 mt-1 bg-amber-50 px-2 py-1 rounded-lg inline-block">
                                  Revision: {del.revisionNotes}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex-shrink-0">
                              {statusLabel[del.status] ?? del.status}
                            </span>
                          </div>

                          {previewUrl ? (
                            <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                  {isVideo(previewUrl) ? <Video size={14} /> : <ImageIcon size={14} />}
                                  {isVideo(previewUrl) ? 'Video preview' : 'Image preview'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => downloadFile(previewUrl, `${del.title.replace(/\s+/g, '-')}.${ext}`)}
                                  className="flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg"
                                >
                                  <Download size={13} /> Download
                                </button>
                              </div>
                              {isVideo(previewUrl) ? (
                                <video src={previewUrl} controls className="w-full max-h-72 rounded-lg bg-black" />
                              ) : (
                                <img src={previewUrl} alt={del.title} className="w-full max-h-72 object-contain rounded-lg" />
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 mb-4">Creator has not uploaded yet</p>
                          )}

                          {reviewable && (
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                              <textarea
                                placeholder="Revision notes (required for revision request)"
                                value={revisionNotes[del.id] ?? ''}
                                onChange={(e) => setRevisionNotes((p) => ({ ...p, [del.id]: e.target.value }))}
                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none h-16"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => approve(del.id)}
                                  disabled={actionId === del.id}
                                  className="flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                                >
                                  <CheckCircle2 size={16} /> Approve & release payment
                                </button>
                                <button
                                  onClick={() => revise(del.id, del.version ?? 1)}
                                  disabled={actionId === del.id || remainingRevisions <= 0}
                                  className="flex items-center gap-1.5 text-sm font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-xl disabled:opacity-50"
                                >
                                  <RefreshCw size={16} /> Request Review ({remainingRevisions} left)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
