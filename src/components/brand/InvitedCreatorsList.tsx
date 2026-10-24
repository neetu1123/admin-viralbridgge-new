'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { brandApi } from '@/src/lib/api';

export type BrandInviteRow = {
  id: string;
  campaignId: string | null;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  isRead: boolean;
  sentAt: string;
  status?: 'added' | 'reinvited' | 'reminded';
  reminderSentAt?: string | null;
};

const statusLabel: Record<NonNullable<BrandInviteRow['status']>, string> = {
  added: 'Added',
  reinvited: 'Re-invited',
  reminded: 'Reminded',
};

function reminderLocked(invite: BrandInviteRow) {
  if (!invite.reminderSentAt) return false;
  const sent = new Date(invite.reminderSentAt).getTime();
  if (Number.isNaN(sent)) return false;
  return Date.now() - sent < 24 * 60 * 60 * 1000;
}

export default function InvitedCreatorsList({
  invites,
  onChange,
  emptyHint,
}: {
  invites: BrandInviteRow[];
  onChange: () => void;
  emptyHint?: React.ReactNode;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (invite: BrandInviteRow, action: 'reinvite' | 'remind') => {
    if (!invite.campaignId || !invite.creatorId) {
      toast.error('This invite cannot be updated');
      return;
    }
    setBusyId(`${action}:${invite.id}`);
    try {
      if (action === 'reinvite') {
        await brandApi.reinviteCreator(invite.campaignId, invite.creatorId);
        toast.success(`Re-invite sent to ${invite.creatorName}`);
      } else {
        await brandApi.remindCreator(invite.campaignId, invite.creatorId);
        toast.success(`Reminder sent. Earning opportunity is waiting for ${invite.creatorName}.`);
      }
      onChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update this invite');
    } finally {
      setBusyId(null);
    }
  };

  if (invites.length === 0) {
    return (
      <div className="px-5 py-8 text-sm text-slate-500">
        {emptyHint ?? (
          <>
            No invites sent yet.{' '}
            <Link href="/creator-discovery" className="font-semibold text-violet-600 hover:text-violet-700">
              Invite a creator
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {invites.map((invite) => {
        const status = invite.status ?? 'added';
        const locked = reminderLocked(invite);
        return (
          <div key={invite.id} className="px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 min-w-0">
              <Mail size={15} className="text-violet-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{invite.creatorName}</p>
                <p className="text-xs text-slate-500 truncate">{invite.campaignTitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {statusLabel[status]}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${invite.isRead ? 'bg-slate-100 text-slate-600' : 'bg-violet-50 text-violet-700'}`}>
                {invite.isRead ? 'Seen' : 'Sent'} · {invite.sentAt || '—'}
              </span>
              <button
                type="button"
                disabled={busyId === `reinvite:${invite.id}`}
                onClick={() => run(invite, 'reinvite')}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-60"
              >
                Re-invite
              </button>
              <button
                type="button"
                disabled={locked || busyId === `remind:${invite.id}`}
                onClick={() => run(invite, 'remind')}
                title={locked ? 'A reminder was sent in the last 24 hours. Another is sent automatically after 24 hours.' : 'Remind the creator that an earning opportunity is waiting'}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Remind
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
