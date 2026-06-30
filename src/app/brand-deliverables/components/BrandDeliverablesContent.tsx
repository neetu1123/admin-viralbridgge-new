'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { brandApi } from '@/src/lib/api';
import { extractList, mapBrandCampaign, type BrandCampaignRow } from '@/src/lib/mappers';

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
  status: string;
  creatorName?: string;
};

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

export default function BrandDeliverablesContent() {
  const [campaigns, setCampaigns] = useState<BrandCampaignRow[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [escrows, setEscrows] = useState<EscrowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDel, setLoadingDel] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    brandApi
      .getCampaigns({ limit: 50 })
      .then((res) => {
        const list = extractList<Record<string, unknown>>(res).map(mapBrandCampaign);
        setCampaigns(list);
        if (list[0]) setCampaignId(list[0].id);
      })
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  const loadDeliverables = useCallback(async () => {
    if (!campaignId) return;
    setLoadingDel(true);
    try {
      const [delRes, escrowRes] = await Promise.all([
        brandApi.getCampaignDeliverables(campaignId),
        brandApi.getEscrows(),
      ]);
      const list = Array.isArray(delRes) ? delRes : [];
      setDeliverables(list.map((d) => normalizeDeliverable(d as Record<string, unknown>)));
      setEscrows(
        (Array.isArray(escrowRes) ? escrowRes : [])
          .filter((e: Record<string, unknown>) => String(e.campaignId ?? e.campaign_id) === campaignId)
          .map((e: Record<string, unknown>) => ({
            id: String(e.id),
            campaignId: String(e.campaignId ?? e.campaign_id),
            creatorId: String(e.creatorId ?? e.creator_id),
            amount: Number(e.amount) || 0,
            status: String(e.status ?? '').toUpperCase(),
            creatorName: String(e.creatorName ?? ''),
          })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load deliverables');
    } finally {
      setLoadingDel(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void loadDeliverables();
  }, [loadDeliverables]);

  const fundEscrow = async (escrow: EscrowRow) => {
    setActionId(escrow.id);
    try {
      await brandApi.fundEscrow({
        campaign_id: escrow.campaignId,
        creator_id: escrow.creatorId,
        amount: escrow.amount,
      });
      toast.success('Escrow funded — creator can now upload');
      await loadDeliverables();
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
      await loadDeliverables();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const revise = async (id: string) => {
    const notes = revisionNotes[id]?.trim();
    if (!notes) {
      toast.error('Add revision notes');
      return;
    }
    setActionId(id);
    try {
      await brandApi.reviseDeliverable(id, notes);
      toast.success('Revision requested');
      await loadDeliverables();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: string) => {
    setActionId(id);
    try {
      await brandApi.rejectDeliverable(id, revisionNotes[id]);
      toast.success('Deliverable rejected');
      await loadDeliverables();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setActionId(null);
    }
  };

  const isVideo = (url?: string | null) => url && /\.(mp4|webm|mov)(\?|$)/i.test(url);
  const pendingEscrows = escrows.filter((e) => e.status === 'PENDING');

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Review Deliverables</h1>
        <p className="text-sm text-slate-500 mt-1">
          Preview creator reels and stories. Approve to release escrow payment automatically.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</label>
        <select
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="mt-1 block w-full max-w-md text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white"
          disabled={loading}
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
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
              <div key={e.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                <span className="text-sm text-slate-700">{e.creatorName || 'Creator'} · ₹{e.amount.toLocaleString()}</span>
                <button
                  onClick={() => fundEscrow(e)}
                  disabled={actionId === e.id}
                  className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {actionId === e.id ? 'Funding...' : 'Fund Escrow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingDel ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading...
        </div>
      ) : deliverables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
          No deliverables for this campaign yet. Approve a creator first.
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((del) => {
            const previewUrl = del.fileUrl ?? del.mediaUrl;
            const creatorName = del.creator?.full_name ?? del.creator?.user?.name ?? 'Creator';
            const reviewable = ['SUBMITTED', 'IN_REVIEW'].includes(del.status);

            return (
              <div key={del.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{del.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{creatorName} · v{del.version ?? 1}</p>
                    {del.notes && <p className="text-sm text-slate-600 mt-2">&quot;{del.notes}&quot;</p>}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {statusLabel[del.status] ?? del.status}
                  </span>
                </div>

                <div className="p-5">
                  {previewUrl ? (
                    <div className="mb-4">
                      {isVideo(previewUrl) ? (
                        <video src={previewUrl} controls className="w-full max-h-96 rounded-xl bg-black" />
                      ) : (
                        <img src={previewUrl} alt={del.title} className="w-full max-h-96 object-contain rounded-xl border" />
                      )}
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 mt-2">
                        <ExternalLink size={12} /> Open file
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                      {del.title.toLowerCase().includes('video') || del.title.toLowerCase().includes('reel') ? (
                        <Video size={16} />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                      Creator has not uploaded yet
                    </p>
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
                          onClick={() => revise(del.id)}
                          disabled={actionId === del.id}
                          className="flex items-center gap-1.5 text-sm font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-xl disabled:opacity-50"
                        >
                          <RefreshCw size={16} /> Request revision
                        </button>
                        <button
                          onClick={() => reject(del.id)}
                          disabled={actionId === del.id}
                          className="flex items-center gap-1.5 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl disabled:opacity-50"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
