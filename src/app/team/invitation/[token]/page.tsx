'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, Loader2, Mail, ShieldCheck, User } from 'lucide-react';
import AppLogo from '@/src/components/ui/AppLogo';
import { organizationApi, type InvitationPreview } from '@/src/lib/api';
import { getToken } from '@/src/lib/useAuth';

export default function TeamInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token ?? '');

  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await organizationApi.getInvitationByToken(token);
      setInvitation(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invitation not found');
      setInvitation(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    const authToken = getToken();
    if (!authToken) {
      const returnUrl = encodeURIComponent(`/team/invitation/${token}`);
      router.push(`/sign-up-login-screen?redirect=${returnUrl}`);
      return;
    }

    setAccepting(true);
    try {
      await organizationApi.acceptInvitation(token);
      toast.success(`You joined ${invitation?.organizationName ?? 'the team'}`);
      const settingsPath =
        invitation?.organizationType === 'CREATOR' ? '/creator-settings' : '/brand-settings';
      router.push(settingsPath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <AppLogo />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-3" />
            <p className="text-sm text-slate-500">Loading invitation...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-slate-800 mb-2">Invitation unavailable</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : invitation ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-violet-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Team Invitation</h1>
              <p className="text-sm text-slate-500 mt-1">
                You&apos;ve been invited to join <strong>{invitation.organizationName}</strong>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Building2 size={16} className="text-violet-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Organization</p>
                  <p className="text-sm font-semibold text-slate-800">{invitation.organizationName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldCheck size={16} className="text-violet-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-semibold text-slate-800">{invitation.roleLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <User size={16} className="text-violet-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Invited by</p>
                  <p className="text-sm font-semibold text-slate-800">{invitation.invitedBy}</p>
                </div>
              </div>
            </div>

            {invitation.canAccept ? (
              <>
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Accepting...
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </button>
                <p className="text-xs text-slate-400 text-center mt-4">
                  Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-red-500">
                  This invitation is {invitation.isExpired ? 'expired' : invitation.status.toLowerCase()}.
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
