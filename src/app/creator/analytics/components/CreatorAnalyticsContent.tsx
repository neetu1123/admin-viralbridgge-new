'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DollarSign, TrendingUp, Briefcase, Target, Loader2, MessageSquare, Mail, Eye, Download } from 'lucide-react';
import { analyticsApi, type AnalyticsRangeParams } from '@/src/lib/api';
import PeriodSelector, { formatCurrency, formatPercent, type AnalyticsDateRange } from '@/src/components/analytics/PeriodSelector';
import { downloadCsv } from '@/src/lib/exportCsv';

const FUNNEL_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'];

function toApiParams(range: AnalyticsDateRange): AnalyticsRangeParams | undefined {
  if (range.period === 'custom') {
    if (!range.from || !range.to) return undefined;
    return { from: range.from, to: range.to };
  }
  return { period: range.period };
}

export default function CreatorAnalyticsContent() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({ period: '30d' });
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof analyticsApi.creatorDashboard>> | null>(null);
  const [earnings, setEarnings] = useState<Awaited<ReturnType<typeof analyticsApi.creatorEarnings>> | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof analyticsApi.creatorProfilePerformance>> | null>(null);
  const [topBrands, setTopBrands] = useState<Awaited<ReturnType<typeof analyticsApi.creatorTopBrands>> | null>(null);

  const apiParams = useMemo(() => toApiParams(dateRange), [dateRange]);

  const load = useCallback(async () => {
    if (dateRange.period === 'custom' && (!dateRange.from || !dateRange.to)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = toApiParams(dateRange);
      const [dash, earn, perf, brands] = await Promise.all([
        analyticsApi.creatorDashboard(params),
        analyticsApi.creatorEarnings(params),
        analyticsApi.creatorProfilePerformance(params),
        analyticsApi.creatorTopBrands(params),
      ]);
      setDashboard(dash);
      setEarnings(earn);
      setProfile(perf);
      setTopBrands(brands);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && apiParams) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const kpis = dashboard?.kpis;
  const kpiCards = [
    { label: 'Total Earnings', value: formatCurrency(kpis?.totalEarnings ?? 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Earnings', value: formatCurrency(kpis?.pendingEarnings ?? 0), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Campaigns Completed', value: String(kpis?.campaignsCompleted ?? 0), icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Application Success Rate', value: formatPercent(kpis?.applicationSuccessRate ?? 0), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const pieData = (earnings?.categoryBreakdown ?? []).map((item, i) => ({
    name: item.name,
    value: item.count,
    color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  }));

  const exportAnalytics = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const periodLabel = dateRange.period === 'custom' ? `${dateRange.from}_${dateRange.to}` : dateRange.period;
    const rows: Record<string, string | number>[] = [];

    if (kpis) {
      rows.push(
        { section: 'KPI', key: 'Total Earnings', value: kpis.totalEarnings ?? 0 },
        { section: 'KPI', key: 'Pending Earnings', value: kpis.pendingEarnings ?? 0 },
        { section: 'KPI', key: 'Campaigns Completed', value: kpis.campaignsCompleted ?? 0 },
        { section: 'KPI', key: 'Application Success Rate', value: kpis.applicationSuccessRate ?? 0 },
      );
    }

    (earnings?.monthlyEarningsTrend ?? []).forEach((row) => {
      rows.push({ section: 'Monthly Earnings', key: row.month, value: row.earnings });
    });

    (earnings?.applicationFunnel ?? []).forEach((row) => {
      rows.push({ section: 'Application Funnel', key: row.status, value: row.count });
    });

    (topBrands?.topBrands ?? []).forEach((brand) => {
      rows.push({
        section: 'Top Brands',
        key: brand.brandName,
        value: brand.earnings,
      });
    });

    if (rows.length === 0) {
      toast.error('No analytics data to export for this period');
      return;
    }

    downloadCsv(`creator-analytics-${periodLabel}-${stamp}.csv`, rows);
    toast.success('Export complete');
  };

  return (
    <div className="pb-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Creator Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Earnings, applications, and brand partnerships</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 bg-white"
          >
            <Download size={15} />
            Export CSV
          </button>
          <PeriodSelector value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={15} className={kpi.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Monthly Earnings Trend</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={earnings?.monthlyEarningsTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [formatCurrency(v), 'Earnings']} />
            <Area type="monotone" dataKey="earnings" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Application Funnel</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={earnings?.applicationFunnel ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Category Breakdown</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">No application data in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Profile Performance</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profile Views', value: profile?.metrics.profileViews ?? 0, icon: Eye, note: 'Not tracked yet' },
              { label: 'Invitations Received', value: profile?.metrics.invitationsReceived ?? 0, icon: Mail },
              { label: 'Messages Received', value: profile?.metrics.messagesReceived ?? 0, icon: MessageSquare },
              { label: 'Campaign Offers', value: profile?.metrics.campaignOffers ?? 0, icon: Briefcase },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon size={14} className="text-violet-600" />
                  <p className="text-xs font-semibold text-slate-500">{m.label}</p>
                </div>
                <p className="text-xl font-bold text-slate-800">{m.value}</p>
                {'note' in m && m.note && <p className="text-[10px] text-slate-400 mt-1">{m.note}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Top Brands Worked With</h2>
          {(topBrands?.topBrands ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No brand partnerships in this period.</p>
          ) : (
            <div className="space-y-3">
              {topBrands!.topBrands.map((brand, i) => (
                <div key={brand.brandId} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{brand.brandName}</p>
                      <p className="text-xs text-slate-400">{brand.campaignCount} campaign(s)</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(brand.earnings)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
