'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';
import { organizationApi, type MyTeamInvitation } from '@/src/lib/api';

export default function AcceptInvitationBanner() {
  const [invitations, setInvitations] = useState<MyTeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingToken, setAcceptingToken] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizationApi.getMyInvitations();
      setInvitations(data);
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleAccept = async (inv: MyTeamInvitation) => {
    setAcceptingToken(inv.token);
    try {
      await organizationApi.acceptInvitation(inv.token);
      toast.success(`You joined ${inv.organizationName}`);
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      setAcceptingToken(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Team invitation</p>
              <p className="text-xs text-slate-600 mt-0.5">
                <span className="font-medium">{inv.invitedBy}</span> invited you to join{' '}
                <span className="font-medium">{inv.organizationName}</span> as{' '}
                <span className="font-medium">{inv.roleLabel}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Expires {new Date(inv.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleAccept(inv)}
            disabled={acceptingToken === inv.token}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {acceptingToken === inv.token ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
