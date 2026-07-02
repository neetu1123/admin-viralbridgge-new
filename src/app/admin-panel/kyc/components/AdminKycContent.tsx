'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { adminApi, type KycRequestApi } from '@/src/lib/api';

const statusCls: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  UNVERIFIED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminKycContent() {
  const [requests, setRequests] = useState<KycRequestApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectTarget, setRejectTarget] = useState<KycRequestApi | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getKycRequests({ status: statusFilter, limit: 50 });
      setRequests(res.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load KYC requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveKyc(id);
      toast.success('KYC approved');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await adminApi.rejectKyc(rejectTarget.id, rejectReason.trim());
      toast.success('KYC rejected');
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reject failed');
    }
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
          <p className="text-slate-500 text-sm mt-1">Review, approve, reject, or revoke creator and brand KYC</p>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {['PENDING', 'VERIFIED', 'REJECTED', 'UNVERIFIED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-violet-600" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">No KYC requests found.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const profile = req.user_type === 'CREATOR' ? req.creator_kyc : req.brand_kyc;
            const canReview = req.status === 'PENDING' || req.status === 'VERIFIED';
            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck size={16} className="text-violet-600" />
                      <p className="font-semibold text-slate-800">{req.user?.name ?? 'User'}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{req.user_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusCls[req.status] ?? statusCls.UNVERIFIED}`}>{req.status}</span>
                    </div>
                    <p className="text-xs text-slate-400">{req.user?.email}</p>
                    <p className="text-xs text-slate-400 mt-1">Submitted {req.submitted_at?.slice(0, 10)}</p>
                    {req.remarks && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                        Last rejection: {req.remarks}
                      </p>
                    )}
                  </div>
                  {canReview && (
                    <div className="flex gap-2">
                      {req.status === 'PENDING' && (
                        <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg">
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => { setRejectTarget(req); setRejectReason(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200"
                      >
                        <XCircle size={14} /> {req.status === 'VERIFIED' ? 'Revoke & Reject' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
                {profile && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {Object.entries(profile).filter(([k]) => !['id', 'user_id', 'kyc_request_id', 'created_at', 'updated_at'].includes(k)).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 rounded-lg p-2">
                        <p className="text-slate-400 uppercase tracking-wide">{k.replace(/_/g, ' ')}</p>
                        <p className="text-slate-700 font-medium truncate">{String(v ?? '—')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Reject KYC</h3>
            <p className="text-xs text-slate-500 mb-3">
              Provide a clear reason for {rejectTarget.user?.name}. They can edit and resubmit their KYC.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Selfie does not match ID, incomplete business documents…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setRejectTarget(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={handleRejectConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
