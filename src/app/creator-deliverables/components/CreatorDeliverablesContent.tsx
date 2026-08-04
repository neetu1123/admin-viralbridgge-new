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
  ChevronDown,
  ChevronUp,
  Plus,
  Briefcase,
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

type CampaignGroup = {
  campaignId: string;
  title: string;
  brand: string;
  deliverables: DeliverableRow[];
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
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [addMediaTarget, setAddMediaTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [delRes, escrowRes] = await Promise.all([
        creatorApi.getDeliverables(),
        creatorApi.getEscrows().catch(() => []),
      ]);
      const list = Array.isArray(delRes) ? delRes : [];
      const mapped = list.map((d) => normalizeDeliverable(d as Record<string, unknown>));
      setDeliverables(mapped);
      setEscrows(
        (Array.isArray(escrowRes) ? escrowRes : []).map((e: Record<string, unknown>) => ({
          campaignId: String(e.campaignId ?? e.campaign_id ?? ''),
          status: String(e.status ?? '').toUpperCase(),
        })),
      );
      const ids = [...new Set(mapped.map((d) => d.campaignId).filter(Boolean))] as string[];
      setExpandedCampaigns(new Set(ids.slice(0, 1)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const campaignGroups = useMemo<CampaignGroup[]>(() => {
    const map = new Map<string, CampaignGroup>();
    for (const del of deliverables) {
      const cid = del.campaignId ?? del.campaign?.id ?? 'unknown';
      const existing = map.get(cid);
      if (existing) {
        existing.deliverables.push(del);
      } else {
        map.set(cid, {
          campaignId: cid,
          title: del.campaign?.title ?? 'Campaign',
          brand: del.campaign?.brand?.company_name ?? 'Brand',
          deliverables: [del],
        });
      }
    }
    return Array.from(map.values());
  }, [deliverables]);

  const escrowByCampaign = useMemo(() => {
    const m = new Map<string, string>();
    escrows.forEach((e) => m.set(e.campaignId, e.status));
    return m;
  }, [escrows]);

  const handleUpload = async (del: DeliverableRow, file: File) => {
    setUploadingId(del.id);
    try {
      await creatorApi.submitDeliverableFile(del.id, file, notesById[del.id]);
      toast.success(`${del.title} submitted for brand review`);
      setAddMediaTarget(null);
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

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => (prev.has(id) ? new Set() : new Set([id])));
  };

  const renderUploadZone = (del: DeliverableRow) => (
    <div className="border-2 border-dashed border-violet-200 rounded-xl p-4 bg-violet-50/30 mt-3">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Upload {del.title.toLowerCase().includes('video') || del.title.toLowerCase().includes('reel') ? 'video' : 'media'}
      </label>
      <textarea
        placeholder="Notes for the brand (optional)"
        value={notesById[del.id] ?? ''}
        onChange={(e) => setNotesById((p) => ({ ...p, [del.id]: e.target.value }))}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 resize-none h-14"
      />
      <label className="flex flex-col items-center justify-center cursor-pointer py-5 rounded-xl bg-white border border-slate-200 hover:border-violet-400 transition-colors">
        {uploadingId === del.id ? (
          <Loader2 className="animate-spin text-violet-600" size={24} />
        ) : (
          <>
            {del.title.toLowerCase().includes('reel') || del.title.toLowerCase().includes('video') ? (
              <Video size={24} className="text-violet-500 mb-2" />
            ) : (
              <ImageIcon size={24} className="text-violet-500 mb-2" />
            )}
            <span className="text-sm font-medium text-slate-600">Click to choose file</span>
            <span className="text-xs text-slate-400 mt-1">MP4, MOV, JPG, PNG (max 100MB)</span>
          </>
        )}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif,application/pdf"
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
  );

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Deliverables</h1>
        <p className="text-sm text-slate-500 mt-1">
          Campaign cards group your deliverables. Open a campaign to upload videos and other media.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading deliverables...
        </div>
      ) : campaignGroups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Upload size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700">No deliverables yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Apply to campaigns and get approved by a brand. Deliverable slots appear here as campaign cards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaignGroups.map((group) => {
            const expanded = expandedCampaigns.has(group.campaignId);
            const blocked = escrowMessage(group.campaignId);
            const pendingCount = group.deliverables.filter((d) => canUpload(d)).length;
            const approvedCount = group.deliverables.filter((d) => d.status === 'APPROVED').length;

            return (
              <div key={group.campaignId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleCampaign(group.campaignId)}
                  className="w-full text-left p-5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase size={18} className="text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{group.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{group.brand}</p>
                        <p className="text-xs text-violet-600 mt-1">{group.deliverables.length} deliverable(s) · {approvedCount} approved</p>
                      </div>
                    </div>
                    {expanded ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                  </div>
                </button>

                {expanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
                    {blocked && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">{blocked}</p>
                      </div>
                    )}

                    {group.deliverables.map((del) => {
                      const cfg = statusConfig[del.status] ?? statusConfig.PENDING;
                      const StatusIcon = cfg.icon;
                      const previewUrl = del.fileUrl ?? del.mediaUrl;

                      return (
                        <div key={del.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-slate-800">{del.title}</h4>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                              <StatusIcon size={10} /> {cfg.label}
                            </span>
                          </div>

                          {del.revisionNotes && (
                            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-2 mb-2">{del.revisionNotes}</p>
                          )}

                          {previewUrl && (
                            <div className="mb-2">
                              {isVideo(previewUrl) ? (
                                <video src={previewUrl} controls className="w-full max-h-40 rounded-lg bg-black" />
                              ) : (
                                <img src={previewUrl} alt={del.title} className="w-full max-h-40 object-contain rounded-lg border border-slate-200" />
                              )}
                            </div>
                          )}

                          {canUpload(del) && renderUploadZone(del)}
                        </div>
                      );
                    })}

                    {pendingCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setAddMediaTarget(addMediaTarget === group.campaignId ? null : group.campaignId)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl py-2.5 transition-colors"
                      >
                        <Plus size={16} /> Add Media
                      </button>
                    )}

                    {addMediaTarget === group.campaignId && (
                      <div className="space-y-3">
                        {group.deliverables.filter(canUpload).map((del) => (
                          <div key={`add-${del.id}`}>{renderUploadZone(del)}</div>
                        ))}
                      </div>
                    )}
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
