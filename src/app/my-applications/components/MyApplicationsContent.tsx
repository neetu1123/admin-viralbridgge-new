'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, MessageSquare, Eye, Clock, CheckCircle, XCircle, Briefcase, DollarSign, Star, AlertTriangle, Upload, Mail } from 'lucide-react';
import OpenDisputeModal from '@/src/components/disputes/OpenDisputeModal';
import MyDisputesPanel from '@/src/components/disputes/MyDisputesPanel';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import { creatorApi } from '@/src/lib/api';
import { extractList, mapCreatorApplication, type CreatorApplicationRow } from '@/src/lib/mappers';
import { isActiveApplicationStatus } from '@/src/lib/applicationUtils';
import { getNotificationActionUrl } from '@/src/lib/notificationNavigation';
import type { NotificationItem } from '@/src/lib/api';

type Application = CreatorApplicationRow;

const statusConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border border-violet-200', icon: Star },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Not Selected', cls: 'bg-red-50 text-red-700 border border-red-200', icon: XCircle },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200', icon: CheckCircle },
};

const paymentStatusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Payment Pending', cls: 'bg-amber-50 text-amber-700' },
  in_escrow: { label: 'In Escrow', cls: 'bg-blue-50 text-blue-700' },
  released: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700' },
};

export default function MyApplicationsContent() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingInvites, setPendingInvites] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState({ approved: 0, pending: 0, completed: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'active');
  const [disputeApp, setDisputeApp] = useState<Application | null>(null);
  const [disputeRefreshKey, setDisputeRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, dashRes, notifRes] = await Promise.all([
        creatorApi.getApplications({ limit: 100 }),
        creatorApi.getDashboard(),
        creatorApi.getNotifications({ limit: 20, unread: true }),
      ]);
      const mapped = extractList<Record<string, unknown>>(appsRes).map(mapCreatorApplication);
      setApplications(mapped);
      const appliedCampaignIds = new Set(mapped.map((a) => a.campaignId));
      const invites = (notifRes.data ?? []).filter((n) => {
        const url = getNotificationActionUrl(n);
        if (!url?.includes('campaign-discovery')) return false;
        const campaignId = url.split('apply=')[1]?.split('&')[0];
        return campaignId && !appliedCampaignIds.has(campaignId);
      });
      setPendingInvites(invites);
      const dash = dashRes as {
        acceptedApplications?: number;
        pendingApplications?: number;
        totalEarnings?: number;
      };
      setStats({
        approved: dash.acceptedApplications ?? mapped.filter((a) => a.status === 'approved').length,
        pending: dash.pendingApplications ?? mapped.filter((a) => a.status === 'pending').length,
        completed: mapped.filter((a) => a.status === 'completed').length,
        totalEarned: Number(dash.totalEarnings) || 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const filtered = applications.filter((a) => {
    const matchSearch =
      a.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? isActiveApplicationStatus(a.status)
          : a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Track your active campaigns, applications, and collaboration status</p>
        </div>
        <Link
          href="/campaign-discovery"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
        >
          <Search size={15} /> Discover Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Campaigns', value: stats.approved, color: 'text-emerald-700', icon: CheckCircle },
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-700', icon: Clock },
          { label: 'Completed', value: stats.completed, color: 'text-violet-700', icon: Briefcase },
          { label: 'Total Earned', value: `₹${stats.totalEarned.toLocaleString()}`, color: 'text-slate-800', icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={stat.color} />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700"
          >
            <option value="active">Active Campaigns</option>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Not Selected</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} applications</span>
      </div>

      {pendingInvites.length > 0 && (
        <div className="mb-4 space-y-2">
          {pendingInvites.map((invite) => {
            const actionUrl = getNotificationActionUrl(invite);
            if (!actionUrl) return null;
            return (
              <div
                key={invite.id}
                className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <Mail size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{invite.title}</p>
                    <p className="text-xs text-slate-500">{invite.message}</p>
                  </div>
                </div>
                <Link
                  href={actionUrl}
                  className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Accept Invitation
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading applications...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((app) => {
          const sConfig = statusConfig[app.status];
          const StatusIcon = sConfig.icon;
          return (
            <div
              key={app.id}
              className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md flex flex-col h-full ${
                app.status === 'approved'
                  ? 'border-emerald-200'
                  : app.status === 'shortlisted'
                    ? 'border-violet-200'
                    : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-700 text-xs font-bold">{app.brandAvatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2">{app.campaignTitle}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sConfig.cls}`}>
                      <StatusIcon size={10} />
                      {sConfig.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {app.brand} · Applied {app.appliedAt}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <PlatformBadge platform={app.platform} />
                  <span className="text-xs font-semibold text-emerald-700">₹{app.budget.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400">Deadline: {app.deadline}</p>
                {app.paymentStatus && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${paymentStatusConfig[app.paymentStatus]?.cls}`}>
                    {paymentStatusConfig[app.paymentStatus]?.label}
                    {app.paymentAmount && ` · ₹${app.paymentAmount.toLocaleString()}`}
                  </span>
                )}
                {app.status === 'rejected' && app.feedback && (
                  <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Rejection reason</p>
                    <p className="text-xs text-red-800 line-clamp-2">{app.feedback}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {app.deliverables.slice(0, 3).map((d) => (
                    <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 mt-auto border-t border-slate-100">
                  {app.status === 'approved' && (
                    <>
                      <Link
                        href="/creator-deliverables"
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload size={12} /> Upload Deliverables
                      </Link>
                      <Link
                        href="/messaging-inbox"
                        className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MessageSquare size={12} /> Message Brand
                      </Link>
                      <button
                        onClick={() => setDisputeApp(app)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <AlertTriangle size={12} /> Raise Issue
                      </button>
                    </>
                  )}
                  {app.status === 'rejected' && (
                    <Link
                      href={`/campaign-discovery/apply/${app.campaignId}`}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reapply
                    </Link>
                  )}
                  <Link
                    href={`/my-applications/${app.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <Briefcase size={36} className="text-slate-300 mb-3" />
            <h3 className="text-slate-700 font-semibold mb-1">No applications found</h3>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or discover new campaigns</p>
            <Link
              href="/campaign-discovery"
              className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              Discover Campaigns
            </Link>
          </div>
        )}
        </div>
      )}

      <div className="mt-8">
        <MyDisputesPanel role="creator" refreshKey={disputeRefreshKey} />
      </div>

      <OpenDisputeModal
        open={!!disputeApp}
        onClose={() => setDisputeApp(null)}
        role="creator"
        campaignId={disputeApp?.campaignId ?? ''}
        campaignTitle={disputeApp?.campaignTitle ?? ''}
        amount={disputeApp?.paymentAmount}
        onSuccess={() => setDisputeRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
