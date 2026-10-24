'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { creatorApi } from '@/src/lib/api';

export default function CreatorStickyStats() {
  const pathname = usePathname();
  const onProfile = pathname.startsWith('/creator-profile');
  const [stats, setStats] = useState({ approved: 0, pending: 0, earned: 0, invites: 0 });
  const [reviewPending, setReviewPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      Promise.all([
        creatorApi.getDashboard().catch(() => null),
        creatorApi.getInvites().catch(() => ({ data: [] })),
        creatorApi.getProfile().catch(() => null),
      ]).then(([dash, invites, profile]) => {
        if (cancelled) return;
        const dashboard = (dash ?? {}) as {
          acceptedApplications?: number;
          pendingApplications?: number;
          earnings?: number;
          totalEarnings?: number;
        };
        const inviteRows = (invites.data ?? []).filter((item) => {
          const title = item.title.toLowerCase();
          return item.type === 'CAMPAIGN_INVITE' || title.includes('earning opportunity') || title.includes('invitation');
        });
        setStats({
          approved: Number(dashboard.acceptedApplications ?? 0),
          pending: Number(dashboard.pendingApplications ?? 0),
          earned: Number(dashboard.earnings ?? dashboard.totalEarnings ?? 0),
          invites: inviteRows.length,
        });
        const record = (profile ?? {}) as { user?: { is_verified?: boolean; settings?: unknown } };
        const settings =
          record.user?.settings && typeof record.user.settings === 'object' && !Array.isArray(record.user.settings)
            ? (record.user.settings as Record<string, unknown>)
            : {};
        setReviewPending(record.user?.is_verified !== true && settings.profileReviewStatus === 'PENDING');
      });
    };
    load();
    const refresh = () => load();
    window.addEventListener('creator-profile-review', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('creator-profile-review', refresh);
    };
  }, []);

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 mb-4 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
        {[
          { label: 'Active campaigns', value: String(stats.approved), icon: CheckCircle, color: 'text-emerald-700' },
          { label: 'Pending review', value: String(stats.pending), icon: Clock, color: 'text-amber-700' },
          { label: 'Total earned', value: `₹${stats.earned.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-slate-800' },
          { label: 'Invites waiting', value: String(stats.invites), icon: Briefcase, color: 'text-violet-700' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white px-4 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Icon size={12} className={item.color} />
                {item.label}
              </p>
              <p className={`mt-1 text-lg font-bold tabular-nums ${item.color}`}>{item.value}</p>
            </div>
          );
        })}
      </div>
      {onProfile && reviewPending && (
        <div className="bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 border-t border-amber-200">
          Congratulations! You have been successfully registered. Your profile verification is under process. We will notify you once it is completed.
        </div>
      )}
      {stats.invites > 0 && (
        <Link href="/my-applications" className="block bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Earning opportunity is waiting · {stats.invites} invite{stats.invites === 1 ? '' : 's'}
        </Link>
      )}
    </div>
  );
}
