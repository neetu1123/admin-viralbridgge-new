'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Building2, DollarSign, Lock, Loader2, Briefcase, ShieldCheck, TrendingUp, Download } from 'lucide-react';
import { analyticsApi, type AnalyticsRangeParams } from '@/src/lib/api';
import PeriodSelector, { formatCurrency, formatPercent, type AnalyticsDateRange } from '@/src/components/analytics/PeriodSelector';
import { downloadCsv } from '@/src/lib/exportCsv';

function toApiParams(range: AnalyticsDateRange): AnalyticsRangeParams | undefined {
  if (range.period === 'custom') {
    if (!range.from || !range.to) return undefined;
    return { from: range.from, to: range.to };
  }
  return { period: range.period };
}

export default function AdminAnalyticsContent() {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({ period: '30d' });
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof analyticsApi.adminDashboard>> | null>(null);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof analyticsApi.adminUsers>> | null>(null);
  const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof analyticsApi.adminRevenue>> | null>(null);
  const [campaigns, setCampaigns] = useState<Awaited<ReturnType<typeof analyticsApi.adminCampaigns>> | null>(null);
  const [kyc, setKyc] = useState<Awaited<ReturnType<typeof analyticsApi.adminKyc>> | null>(null);
  const [platforms, setPlatforms] = useState<Awaited<ReturnType<typeof analyticsApi.adminPlatforms>> | null>(null);

  const apiParams = useMemo(() => toApiParams(dateRange), [dateRange]);

  const load = useCallback(async () => {
    if (dateRange.period === 'custom' && (!dateRange.from || !dateRange.to)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = toApiParams(dateRange);
      const [dash, usersRes, revenueRes, campaignsRes, kycRes, platformsRes] = await Promise.all([
        analyticsApi.adminDashboard(params),
        analyticsApi.adminUsers(params),
        analyticsApi.adminRevenue(params),
        analyticsApi.adminCampaigns(params),
        analyticsApi.adminKyc(params),
        analyticsApi.adminPlatforms(params),
      ]);
      setDashboard(dash);
      setUsers(usersRes);
      setRevenue(revenueRes);
      setCampaigns(campaignsRes);
      setKyc(kycRes);
      setPlatforms(platformsRes);
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
    { label: 'Total Creators', value: String(kpis?.totalCreators ?? 0), icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Brands', value: String(kpis?.totalBrands ?? 0), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Platform Revenue', value: formatCurrency(kpis?.platformRevenue ?? 0), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Escrow Volume', value: formatCurrency(kpis?.escrowVolume ?? 0), icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const campaignStats = campaigns?.campaignAnalytics;
  const kycStats = kyc?.kycAnalytics;

  const exportAnalytics = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const periodLabel = dateRange.period === 'custom' ? `${dateRange.from}_${dateRange.to}` : dateRange.period;
    const rows: Record<string, string | number>[] = [];

    if (kpis) {
      rows.push(
        { section: 'KPI', key: 'Total Creators', value: kpis.totalCreators ?? 0 },
        { section: 'KPI', key: 'Total Brands', value: kpis.totalBrands ?? 0 },
        { section: 'KPI', key: 'Platform Revenue', value: kpis.platformRevenue ?? 0 },
        { section: 'KPI', key: 'Escrow Volume', value: kpis.escrowVolume ?? 0 },
      );
    }

    (users?.userGrowth ?? []).forEach((row) => {
      rows.push({ section: 'User Growth', key: `${row.month} creators`, value: row.creators });
      rows.push({ section: 'User Growth', key: `${row.month} brands`, value: row.brands });
    });

    (revenue?.revenueGrowth ?? []).forEach((row) => {
      rows.push({ section: 'Revenue Growth', key: row.month, value: row.revenue });
    });

    (campaigns?.campaignGrowth ?? []).forEach((row) => {
      rows.push({ section: 'Campaign Growth', key: row.month, value: row.count });
    });

    (platforms?.platformDistribution ?? []).forEach((row) => {
      rows.push({ section: 'Platform Distribution', key: row.name, value: row.value });
    });

    if (rows.length === 0) {
      toast.error('No analytics data to export for this period');
      return;
    }

    downloadCsv(`admin-analytics-${periodLabel}-${stamp}.csv`, rows);
    toast.success('Export complete');
  };

  return (
    <div className="pb-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Users, revenue, campaigns, and platform distribution</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={users?.userGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="creators" stroke="#8b5cf6" strokeWidth={2} name="Creators" />
              <Line type="monotone" dataKey="brands" stroke="#3b82f6" strokeWidth={2} name="Brands" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Growth Metrics</h2>
          <div className="space-y-3">
            {[
              { label: 'New Creators', value: users?.growthMetrics.newCreators ?? 0, change: users?.growthMetrics.creatorGrowthPercent },
              { label: 'New Brands', value: users?.growthMetrics.newBrands ?? 0, change: users?.growthMetrics.brandGrowthPercent },
              { label: 'Revenue Growth', value: formatCurrency(revenue?.growthMetrics.totalRevenue ?? 0), change: revenue?.growthMetrics.revenueGrowthPercent },
              { label: 'Campaign Growth', value: campaignStats?.created ?? 0, change: campaigns?.growthMetrics.campaignGrowthPercent },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-lg font-bold text-slate-800">{item.value}</p>
                </div>
                {typeof item.change === 'number' && (
                  <span className={`text-xs font-semibold ${item.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{formatPercent(item.change)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Revenue Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue?.revenueGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Campaign Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={campaigns?.campaignGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="Campaigns" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={15} /> Campaign Analytics</h2>
          <div className="space-y-2">
            {[
              { label: 'Created', value: campaignStats?.created ?? 0 },
              { label: 'Active', value: campaignStats?.active ?? 0 },
              { label: 'Completed', value: campaignStats?.completed ?? 0 },
              { label: 'Flagged', value: campaignStats?.flagged ?? 0 },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className="text-sm font-bold text-slate-800">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={15} /> KYC Analytics</h2>
          <div className="space-y-2">
            {[
              { label: 'Verified', value: kycStats?.verified ?? 0, color: 'text-emerald-600' },
              { label: 'Pending', value: kycStats?.pending ?? 0, color: 'text-amber-600' },
              { label: 'Rejected', value: kycStats?.rejected ?? 0, color: 'text-red-500' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-600">{row.label}</span>
                <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={15} /> Top Categories</h2>
          {(platforms?.topCategories ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No category data in this period.</p>
          ) : (
            <div className="space-y-2">
              {platforms!.topCategories.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Platform Distribution</h2>
        {(platforms?.platformDistribution ?? []).length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No platform data in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={platforms!.platformDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {platforms!.platformDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
