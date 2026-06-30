'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  Upload,
  Video,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { creatorApi } from '@/src/lib/api';

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
  campaignId?: string;
  campaign?: { id?: string; title?: string; brand?: { company_name?: string } };
};

type EscrowRow = {
  campaignId: string;
  status: string;
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING: { label: 'Awaiting upload', cls: 'bg-slate-100 text-slate-600', icon: Clock },
  SUBMITTED: { label: 'Submitted — brand reviewing', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  IN_REVIEW: { label: 'Under review', cls: 'bg-amber-100 text-amber-800', icon: Clock },
  REVISION_REQUESTED: { label: 'Revision requested', cls: 'bg-orange-100 text-orange-800', icon: RefreshCw },
  APPROVED: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-800', icon: AlertCircle },
};

function normalizeDeliverable(raw: Record<string, unknown>): DeliverableRow {
  const campaign = raw.campaign as DeliverableRow['campaign'];
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
    campaignId: String(raw.campaignId ?? raw.campaign_id ?? campaign?.id ?? ''),
    campaign,
  };
}

export default function CreatorDeliverablesContent() {
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [escrows, setEscrows] = useState<EscrowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [delRes, escrowRes] = await Promise.all([
        creatorApi.getDeliverables(),
        creatorApi.getEscrows().catch(() => []),
      ]);
      const list = Array.isArray(delRes) ? delRes : [];
      setDeliverables(list.map((d) => normalizeDeliverable(d as Record<string, unknown>)));
      setEscrows(
        (Array.isArray(escrowRes) ? escrowRes : []).map((e: Record<string, unknown>) => ({
          campaignId: String(e.campaignId ?? e.campaign_id ?? ''),
          status: String(e.status ?? '').toUpperCase(),
        })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const escrowByCampaign = useMemo(() => {
    const map = new Map<string, string>();
    escrows.forEach((e) => map.set(e.campaignId, e.status));
    return map;
  }, [escrows]);

  const handleUpload = async (del: DeliverableRow, file: File) => {
    setUploadingId(del.id);
    try {
      await creatorApi.submitDeliverableFile(del.id, file, notesById[del.id]);
      toast.success(`${del.title} submitted for brand review`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const campaignIdFor = (del: DeliverableRow) => del.campaignId ?? del.campaign?.id;

  const canUpload = (del: DeliverableRow) => {
    const cid = campaignIdFor(del);
    if (!cid) return false;
    const escrowStatus = escrowByCampaign.get(cid);
    const uploadableStatus = ['PENDING', 'REVISION_REQUESTED', 'REJECTED'].includes(del.status);
    return uploadableStatus && escrowStatus === 'HELD';
  };

  const escrowMessage = (campaignId: string) => {
    const status = escrowByCampaign.get(campaignId);
    if (!status) return 'Brand has not set up escrow yet.';
    if (status === 'PENDING') return 'Brand must fund escrow before you can upload.';
    if (status === 'HELD') return null;
    if (status === 'RELEASED') return 'Payment released — no further uploads needed.';
    return `Escrow status: ${status}`;
  };

  const isVideo = (url?: string | null) => url && /\.(mp4|webm|mov)(\?|$)/i.test(url);

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Deliverables</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload reels, videos, and story images for approved campaigns. Brand reviews here — payment releases after approval.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading deliverables...
        </div>
      ) : deliverables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Upload size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700">No deliverables yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Apply to campaigns and get approved by a brand. Deliverable slots (reels, stories) appear here after approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((del) => {
            const cfg = statusConfig[del.status] ?? statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            const previewUrl = del.fileUrl ?? del.mediaUrl;
            const blocked = (() => {
              const cid = campaignIdFor(del);
              return cid ? escrowMessage(cid) : 'Brand has not set up escrow yet.';
            })();

            return (
              <div key={del.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-violet-600 font-semibold uppercase tracking-wide">
                      {del.campaign?.title ?? 'Campaign'}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 mt-0.5">{del.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {del.campaign?.brand?.company_name ?? 'Brand'} · v{del.version ?? 1}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.cls}`}>
                    <StatusIcon size={12} /> {cfg.label}
                  </span>
                </div>

                <div className="p-5">
                  {del.revisionNotes && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-orange-800">Brand feedback</p>
                      <p className="text-sm text-orange-700 mt-1">{del.revisionNotes}</p>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="mb-4">
                      {isVideo(previewUrl) ? (
                        <video src={previewUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
                      ) : (
                        <img src={previewUrl} alt={del.title} className="w-full max-h-80 object-contain rounded-xl border border-slate-200" />
                      )}
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 mt-2 hover:underline"
                      >
                        <ExternalLink size={12} /> Open full file
                      </a>
                    </div>
                  )}

                  {canUpload(del) ? (
                    <div className="border-2 border-dashed border-violet-200 rounded-xl p-5 bg-violet-50/30">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Upload {del.title.includes('Reel') || del.title.includes('Video') ? 'video' : 'image'}
                      </label>
                      <textarea
                        placeholder="Notes for the brand (optional)"
                        value={notesById[del.id] ?? ''}
                        onChange={(e) => setNotesById((p) => ({ ...p, [del.id]: e.target.value }))}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 resize-none h-16"
                      />
                      <label className="flex flex-col items-center justify-center cursor-pointer py-6 rounded-xl bg-white border border-slate-200 hover:border-violet-400 transition-colors">
                        {uploadingId === del.id ? (
                          <Loader2 className="animate-spin text-violet-600" size={28} />
                        ) : (
                          <>
                            {del.title.toLowerCase().includes('reel') || del.title.toLowerCase().includes('video') ? (
                              <Video size={28} className="text-violet-500 mb-2" />
                            ) : (
                              <ImageIcon size={28} className="text-violet-500 mb-2" />
                            )}
                            <span className="text-sm font-medium text-slate-600">Click to choose file</span>
                            <span className="text-xs text-slate-400 mt-1">MP4, MOV, JPG, PNG (max 100MB)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          disabled={uploadingId === del.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleUpload(del, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  ) : blocked ? (
                    <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600">{blocked}</p>
                    </div>
                  ) : del.status === 'SUBMITTED' || del.status === 'IN_REVIEW' ? (
                    <p className="text-sm text-slate-500">Waiting for brand to approve or request changes.</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
