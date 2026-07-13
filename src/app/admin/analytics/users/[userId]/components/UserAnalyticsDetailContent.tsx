'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, User, Mail, Shield, Calendar, Wallet, Briefcase, Activity, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '@/src/lib/api';
import { formatCurrency } from '@/src/components/analytics/PeriodSelector';

export default function UserAnalyticsDetailContent() {
  const params = useParams();
  const userId = String(params.userId ?? '');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof analyticsApi.adminUserDetail>> | null>(null);
  const [wallet, setWallet] = useState<Awaited<ReturnType<typeof analyticsApi.adminUserWallet>> | null>(null);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof analyticsApi.adminUserActivity>> | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [detailRes, walletRes, activityRes] = await Promise.all([
        analyticsApi.adminUserDetail(userId),
        analyticsApi.adminUserWallet(userId),
        analyticsApi.adminUserActivity(userId),
      ]);
      setDetail(detailRes);
      setWallet(walletRes);
      setActivity(activityRes);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!detail) {
    return <p className="text-slate-500 text-sm p-8">User not found.</p>;
  }

  const { user, campaignSummary, walletSummary, activitySummary, roleSpecific } = detail;
  const isCreator = user.role === 'CREATOR';
  const earningsTrend = (roleSpecific as { earningsTrend?: { month: string; earnings: number }[] })?.earningsTrend ?? [];

  return (
    <div className="pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/analytics" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email} · {user.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Joined', value: new Date(user.joinedAt).toLocaleDateString(), icon: Calendar },
          { label: 'Verification', value: user.verificationStatus, icon: Shield },
          { label: 'Status', value: user.status, icon: User },
          { label: 'Profile Complete', value: `${activitySummary.profileCompletion}%`, icon: Activity },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <item.icon size={14} /> {item.label}
            </div>
            <p className="text-lg font-bold text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={15} /> Campaign Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Created</span><p className="font-bold">{campaignSummary.created}</p></div>
            <div><span className="text-slate-500">Active</span><p className="font-bold">{campaignSummary.active}</p></div>
            <div><span className="text-slate-500">Completed</span><p className="font-bold">{campaignSummary.completed}</p></div>
            <div><span className="text-slate-500">Success Rate</span><p className="font-bold">{campaignSummary.successRate}%</p></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Wallet size={15} /> Wallet Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Available</span><p className="font-bold">{formatCurrency(walletSummary.availableBalance)}</p></div>
            <div><span className="text-slate-500">Locked</span><p className="font-bold">{formatCurrency(walletSummary.lockedBalance)}</p></div>
            <div><span className="text-slate-500">Lifetime Earnings</span><p className="font-bold">{formatCurrency(walletSummary.lifetimeEarnings)}</p></div>
            <div><span className="text-slate-500">Withdrawn</span><p className="font-bold">{formatCurrency(wallet?.withdrawnAmount ?? 0)}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Mail size={15} /> Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-slate-500">Last Login</span><p className="font-medium">{activitySummary.lastLogin ? new Date(activitySummary.lastLogin).toLocaleString() : '—'}</p></div>
          <div><span className="text-slate-500">Last Active</span><p className="font-medium">{activitySummary.lastActive ? new Date(activitySummary.lastActive).toLocaleString() : '—'}</p></div>
          <div><span className="text-slate-500">Last Campaign</span><p className="font-medium">{activitySummary.lastCampaign ? new Date(activitySummary.lastCampaign).toLocaleString() : '—'}</p></div>
          <div><span className="text-slate-500">Last Message</span><p className="font-medium">{activitySummary.lastMessage ? new Date(activitySummary.lastMessage).toLocaleString() : '—'}</p></div>
        </div>
      </div>

      {isCreator && roleSpecific && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Creator Metrics</h2>
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div><span className="text-slate-500">Submitted</span><p className="font-bold">{(roleSpecific as { applicationsSubmitted?: number }).applicationsSubmitted ?? 0}</p></div>
            <div><span className="text-slate-500">Approved</span><p className="font-bold">{(roleSpecific as { applicationsApproved?: number }).applicationsApproved ?? 0}</p></div>
            <div><span className="text-slate-500">Rejected</span><p className="font-bold">{(roleSpecific as { applicationsRejected?: number }).applicationsRejected ?? 0}</p></div>
          </div>
        </div>
      )}

      {!isCreator && roleSpecific && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Brand Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-slate-500">Campaign Spend</span><p className="font-bold">{formatCurrency((roleSpecific as { campaignSpend?: number }).campaignSpend ?? 0)}</p></div>
            <div><span className="text-slate-500">Invitations</span><p className="font-bold">{(roleSpecific as { creatorInvitations?: number }).creatorInvitations ?? 0}</p></div>
            <div><span className="text-slate-500">Applications</span><p className="font-bold">{(roleSpecific as { applicationsReceived?: number }).applicationsReceived ?? 0}</p></div>
            <div><span className="text-slate-500">Completion Rate</span><p className="font-bold">{(roleSpecific as { campaignCompletionRate?: number }).campaignCompletionRate ?? 0}%</p></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={15} /> Monthly Activity</h2>
          {(activity?.monthlyActivity ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No activity in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activity!.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="campaigns" fill="#7c3aed" name="Campaigns" radius={[4, 4, 0, 0]} />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="messages" fill="#10b981" name="Messages" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {isCreator && earningsTrend.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Earnings Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={earningsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="earnings" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
