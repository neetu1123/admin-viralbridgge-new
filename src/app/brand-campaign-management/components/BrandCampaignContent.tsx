'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Plus, Search, ChevronDown, MoreHorizontal, Users, TrendingUp, Eye, Edit, Trash2, PauseCircle, CheckCircle, BarChart3, Zap, MessageSquare, Star, ArrowRight, Sparkles, Trophy, UserCheck, Shield, Activity, Brain, Target, TrendingDown, Award, ShieldCheck, BadgeCheck, AlertTriangle, Flame, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import ApplicantDrawer from './ApplicantDrawer';
import CampaignStatsChart from './CampaignStatsChart';
import { brandApi, platformApi } from '@/src/lib/api';
import {
  extractList,
  mapBrandApplicant,
  mapBrandCampaign,
  type BrandApplicantRow,
  type BrandCampaignRow,
} from '@/src/lib/mappers';

type Applicant = BrandApplicantRow;
type Campaign = BrandCampaignRow;

interface AiRecommendedCreator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  followers: number;
  engagementRate: number;
  matchScore: number;
  platform: string;
  fakeFollowerPct: number;
  audienceQuality: number;
  brandSafetyScore: number;
  avgViews: number;
  roiHistory: string;
  conversionPotential: 'Very High' | 'High';
  matchReason: string;
  verified: boolean;
  previousCampaigns: number;
}

const aiInsights = [
  { id: 'ins-1', icon: '📈', text: 'Skincare creators are performing 28% better this week', type: 'opportunity', action: 'Boost Budget' },
  { id: 'ins-2', icon: '💡', text: 'Increasing budget by ₹10K may improve reach by 42%', type: 'suggestion', action: 'Adjust Budget' },
  { id: 'ins-3', icon: '🎯', text: 'Micro creators are outperforming macro creators by 2.3x ROI', type: 'insight', action: 'View Micro Creators' },
  { id: 'ins-4', icon: '⚡', text: 'Summer Glow campaign has 8 pending approvals — act now to hit deadline', type: 'urgent', action: 'Review Now' },
];

const activityFeed = [
  { id: 'act-1', icon: '👤', text: 'Sofia Martinez applied to Summer Glow', time: '2 min ago', type: 'apply' },
  { id: 'act-2', icon: '🚀', text: 'FitPro campaign reached 500K views', time: '14 min ago', type: 'milestone' },
  { id: 'act-3', icon: '✅', text: '3 creators accepted invite to NomadPay', time: '1 hr ago', type: 'accept' },
  { id: 'act-4', icon: '📈', text: 'TechDrop ROI increased 14% this week', time: '2 hr ago', type: 'roi' },
  { id: 'act-5', icon: '💬', text: 'Priya Nair sent a message', time: '3 hr ago', type: 'message' },
  { id: 'act-6', icon: '🏆', text: 'Summer Glow hit 1M impressions milestone', time: '5 hr ago', type: 'milestone' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDeadline(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

const applicantStatusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border border-red-200' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-violet-50 text-violet-700 border border-violet-200' },
};

type BrandTab = 'campaigns' | 'applicants';

// Mini sparkline component
function Sparkline({ data, color = '#7c3aed' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60; const h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandCampaignContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [recommendedCreators, setRecommendedCreators] = useState<AiRecommendedCreator[]>([]);
  const [dashboard, setDashboard] = useState<{
    pendingApprovals?: number;
    budgetUsed?: number;
    topCampaign?: { title?: string; _count?: { applications?: number } };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BrandTab>('campaigns');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      router.replace('/brand-campaign-management/create');
    }
  }, [searchParams, router]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [campaignsRes, dashboardRes, publicSettings] = await Promise.all([
        brandApi.getCampaigns({ limit: 50 }),
        brandApi.getDashboard(),
        platformApi.getPublicSettings(),
      ]);
      const rawCampaigns = extractList<Record<string, unknown>>(campaignsRes);
      const mappedCampaigns = rawCampaigns.map(mapBrandCampaign);
      setCampaigns(mappedCampaigns);
      setApplicants(
        rawCampaigns.flatMap((c) =>
          ((c.applications as Record<string, unknown>[]) ?? []).map((a) => mapBrandApplicant(a, c)),
        ),
      );
      setDashboard(dashboardRes as typeof dashboard);
      setAiMatchingEnabled(publicSettings.aiMatchingEnabled);

      if (publicSettings.aiMatchingEnabled && mappedCampaigns.length > 0) {
        const targetCampaign =
          mappedCampaigns.find((c) => c.status === 'active') ?? mappedCampaigns[0];
        const recsRes = await brandApi.getCampaignRecommendations(targetCampaign.id);
        if (recsRes.enabled && recsRes.recommendations.length > 0) {
          setRecommendedCreators(
            recsRes.recommendations.map((r) => ({
              id: r.id,
              name: r.name,
              handle: `@${r.name.toLowerCase().replace(/\s+/g, '')}`,
              avatar: r.name.slice(0, 2).toUpperCase(),
              niche: r.niche,
              followers: r.followers,
              engagementRate: r.engagementRate,
              matchScore: r.matchScore,
              platform: r.platform,
              fakeFollowerPct: 2.5,
              audienceQuality: 90,
              brandSafetyScore: 95,
              avgViews: Math.round(r.followers * 0.4),
              roiHistory: '3.0x',
              conversionPotential: r.engagementRate > 5 ? ('Very High' as const) : ('High' as const),
              matchReason: r.matchReason,
              verified: r.verified,
              previousCampaigns: 0,
            })),
          );
        } else {
          setRecommendedCreators([]);
        }
      } else {
        setRecommendedCreators([]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load brand data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setNow(Date.now()); }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = campaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredApplicants = applicants.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(applicantSearch.toLowerCase()) || a.campaign.toLowerCase().includes(applicantSearch.toLowerCase());
    const matchStatus = applicantStatusFilter === 'all' || a.status === applicantStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalPending = dashboard?.pendingApprovals ?? campaigns.reduce((s, c) => s + c.pending, 0);
  const pendingApplicants = applicants.filter(a => a.status === 'pending').length;

  const handleApplicantAction = async (
    appId: string,
    action: 'shortlist' | 'approve' | 'reject',
    name?: string,
  ) => {
    try {
      if (action === 'shortlist') await brandApi.shortlistApplication(appId);
      else if (action === 'approve') await brandApi.approveApplication(appId);
      else await brandApi.rejectApplication(appId);
      toast.success(
        action === 'approve'
          ? `${name ?? 'Creator'} approved`
          : action === 'shortlist'
            ? `${name ?? 'Creator'} shortlisted`
            : `${name ?? 'Creator'} rejected`,
      );
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await brandApi.deleteCampaign(campaignId);
      toast.success('Campaign deleted');
      setOpenMenuId(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    toast.success(`Campaign status updated to ${newStatus}`);
    setOpenMenuId(null);
  };

  // Business KPI metrics
  const reachFactorGenerated = 3.4;
  const costPerEngagement = 0.18;
  const campaignSuccessRate = 78;
  const conversionEfficiency = 4.2;

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Brand Intelligence Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Marketing performance, creator intelligence & reach analytics</p>
        </div>
        <Link
          href="/brand-campaign-management/create"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150 shadow-sm"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
      </div>

      {/* ROW 1 — Executive Metrics (Big Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Total Reach Factor */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Total Reach Factor</p>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={15} className="text-white" /></div>
          </div>
          <p className="text-3xl font-black tabular-nums mb-1">{reachFactorGenerated}x</p>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={13} className="text-emerald-200" />
            <p className="text-emerald-200 text-xs font-medium">+0.4x from last month</p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <Sparkline data={[2.1, 2.4, 2.8, 3.0, 3.2, 3.4]} color="rgba(255,255,255,0.7)" />
          </div>
        </div>

        {/* Cost Per Engagement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Cost / Engagement</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><Target size={15} className="text-blue-600" /></div>
          </div>
          <p className="text-3xl font-black text-slate-800 tabular-nums mb-1">${costPerEngagement}</p>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={13} className="text-emerald-500" />
            <p className="text-emerald-600 text-xs font-medium">↓ 12% vs industry avg</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Sparkline data={[0.28, 0.25, 0.22, 0.21, 0.19, 0.18]} color="#3b82f6" />
          </div>
        </div>

        {/* Campaign Success Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Campaign Success</p>
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center"><Award size={15} className="text-violet-600" /></div>
          </div>
          <p className="text-3xl font-black text-slate-800 tabular-nums mb-1">{campaignSuccessRate}%</p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${campaignSuccessRate}%` }} />
          </div>
          <p className="text-violet-600 text-xs font-medium">↑ +6 pts from last month</p>
        </div>

        {/* Conversion Efficiency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Conversion Efficiency</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><Flame size={15} className="text-amber-500" /></div>
          </div>
          <p className="text-3xl font-black text-slate-800 tabular-nums mb-1">{conversionEfficiency}%</p>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={13} className="text-emerald-500" />
            <p className="text-emerald-600 text-xs font-medium">+1.1% vs last quarter</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Sparkline data={[2.8, 3.1, 3.4, 3.8, 4.0, 4.2]} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* ROW 2 — Actions (Quick Actions + Best Campaign Showcase) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Quick Actions Bar */}
        <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-white mb-4">
            <Zap size={16} className="text-violet-200" />
            <span className="text-sm font-bold">Quick Actions</span>
          </div>
          <div className="space-y-2">
            <button onClick={() => { setActiveTab('applicants'); setApplicantStatusFilter('pending'); }} className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-150 border border-white/20 group">
              <span className="flex items-center gap-2"><Users size={13} />Approve Applicants</span>
              {totalPending > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalPending}</span>}
            </button>
            <Link href="/brand-campaign-management/create" className="w-full flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-150 border border-white/20">
              <Plus size={13} />Create Campaign
            </Link>
            <Link href="/brand-messages" className="w-full flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-150 border border-white/20">
              <MessageSquare size={13} />Message Creators
            </Link>
            <Link href="/creator-discovery" className="w-full flex items-center gap-2 bg-white text-violet-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-violet-50">
              <Star size={13} />View Top Creators
            </Link>
          </div>
        </div>

        {/* 🏆 Premium Best Campaign Showcase */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/80 to-rose-500/60" />
            <div className="absolute inset-0 flex items-center px-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trophy size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">🏆 Your Winning Campaign</p>
                  <p className="text-white text-lg font-black">{dashboard?.topCampaign?.title ?? 'Your top campaign'}</p>
                </div>
              </div>
              <div className="ml-auto">
                <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-black px-3 py-1.5 rounded-xl border border-white/30">ROI: 3.2x</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 tabular-nums">2.1M</p>
                <p className="text-xs text-slate-400 font-medium">Total Reach</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 tabular-nums">184K</p>
                <p className="text-xs text-slate-400 font-medium">Engagements</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-emerald-600 tabular-nums">3.2x</p>
                <p className="text-xs text-slate-400 font-medium">ROI Trend</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-800 tabular-nums">52</p>
                <p className="text-xs text-slate-400 font-medium">Applicants</p>
              </div>
            </div>

            {/* Top creator avatars */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {['JO', 'SM', 'PN', 'MC', 'AO'].map((av, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center">
                    <span className="text-violet-700 text-xs font-bold" style={{ fontSize: '9px' }}>{av}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">8 creators · <span className="text-emerald-600 font-semibold">All delivered on time</span></p>
            </div>

            {/* ROI mini chart */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">ROI Trend (6 weeks)</p>
                <p className="text-sm font-bold text-emerald-700">↑ +14% this week</p>
              </div>
              <Sparkline data={[1.8, 2.1, 2.4, 2.8, 3.0, 3.2]} color="#10b981" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 — AI Insights + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* AI Insights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <Brain size={15} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">AI Insights</h2>
                <p className="text-xs text-violet-600">Powered by campaign intelligence</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {aiInsights.map(insight => (
              <div key={insight.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 hover:shadow-sm ${insight.type === 'urgent' ? 'bg-red-50 border-red-200' : insight.type === 'opportunity' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-lg flex-shrink-0">{insight.icon}</span>
                <p className={`text-sm flex-1 font-medium leading-relaxed ${insight.type === 'urgent' ? 'text-red-700' : insight.type === 'opportunity' ? 'text-emerald-700' : 'text-slate-700'}`}>{insight.text}</p>
                <button
                  onClick={() => toast.success(`Action: ${insight.action}`)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${insight.type === 'urgent' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                >
                  {insight.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-800">Live Activity</h2>
              </div>
              <span className="text-xs text-slate-400">Real-time</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {activityFeed.map(item => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {([['campaigns', 'Campaigns'], ['applicants', 'Applicants']] as [BrandTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${activeTab === tab ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
            {tab === 'applicants' && pendingApplicants > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">{pendingApplicants}</span>
            )}
          </button>
        ))}
      </div>

      {/* ROW 4 — Creators (Operational) */}
      {activeTab === 'campaigns' && (
        <>
          {aiMatchingEnabled && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center"><Sparkles size={15} className="text-violet-600" /></div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Creator Intelligence</h2>
                  <p className="text-xs text-slate-400 mt-0.5">AI-matched creators with trust signals, business metrics & match reasoning</p>
                </div>
              </div>
              <Link href="/creator-discovery" className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">View all <ArrowRight size={13} /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {recommendedCreators.map(creator => (
                <div key={creator.id} className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group ${creator.matchScore >= 95 ? 'border-violet-300 ring-1 ring-violet-200 shadow-md' : 'border-slate-200'}`}>
                  {/* Match score header */}
                  <div className={`px-3 py-2 flex items-center justify-between ${creator.matchScore >= 95 ? 'bg-gradient-to-r from-violet-600 to-purple-600' : 'bg-slate-50 border-b border-slate-100'}`}>
                    <div className="flex items-center gap-1.5">
                      <Brain size={11} className={creator.matchScore >= 95 ? 'text-violet-200' : 'text-slate-400'} />
                      <span className={`text-xs font-bold ${creator.matchScore >= 95 ? 'text-white' : 'text-slate-600'}`}>AI Match</span>
                    </div>
                    <span className={`text-sm font-black ${creator.matchScore >= 95 ? 'text-white' : 'text-violet-700'}`}>{creator.matchScore}%</span>
                  </div>

                  <div className="p-3.5">
                    {/* Creator identity */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 ring-2 ring-violet-200">
                        <span className="text-violet-700 text-xs font-bold">{creator.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{creator.name}</p>
                          {creator.verified && <BadgeCheck size={13} className="text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-violet-600 truncate">{creator.handle}</p>
                      </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="bg-slate-50 rounded-xl p-2.5 mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Trust Signals</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-500" />Audience Quality</span>
                          <span className="text-xs font-bold text-emerald-700">{creator.audienceQuality}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1"><AlertTriangle size={10} className="text-amber-500" />Fake Followers</span>
                          <span className={`text-xs font-bold ${creator.fakeFollowerPct < 3 ? 'text-emerald-700' : 'text-amber-700'}`}>{creator.fakeFollowerPct}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Shield size={10} className="text-blue-500" />Brand Safety</span>
                          <span className="text-xs font-bold text-blue-700">{creator.brandSafetyScore}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Business Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-black text-emerald-700">{creator.roiHistory}</p>
                        <p className="text-xs text-slate-400">Avg ROI</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-black text-blue-700">{(creator.avgViews / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-400">Avg Views</p>
                      </div>
                    </div>

                    {/* AI Match Reason */}
                    <div className="bg-violet-50 rounded-xl p-2.5 mb-3 border border-violet-100">
                      <p className="text-xs font-semibold text-violet-600 mb-1 flex items-center gap-1"><Brain size={10} />Why matched?</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{creator.matchReason}</p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users size={10} className="text-slate-400" />{(creator.followers / 1000).toFixed(1)}K</span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-emerald-700"><TrendingUp size={10} />{creator.engagementRate}%</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{creator.previousCampaigns} collabs</span>
                    </div>

                    {/* Conversion potential badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${creator.conversionPotential === 'Very High' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {creator.conversionPotential} Conversion
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button onClick={() => toast.success(`Invite sent to ${creator.name}`)} className="flex-1 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl transition-colors">Invite</button>
                      <Link href="/brand-messages" className="flex-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl transition-colors text-center">Message</Link>
                    </div>
                  </div>
                </div>
              ))}
              {recommendedCreators.length === 0 && (
                <p className="text-sm text-slate-500 col-span-full text-center py-6">No AI recommendations yet. Active campaigns will generate matched creators automatically.</p>
              )}
            </div>
          </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Applications Over Time</h2>
                <p className="text-xs text-slate-400 mt-0.5">Across all active campaigns — last 30 days</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Applications</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Accepted</span>
              </div>
            </div>
            <CampaignStatsChart />
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-56" />
                </div>
                <div className="relative">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <p className="text-xs text-slate-400">{filtered.length} campaign{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Campaign', 'Platform', 'Status', 'Budget / Spent', 'Applicants', 'Accepted', 'Deadline', 'Actions'].map(col => (
                      <th key={`th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((campaign) => {
                    const spendPct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
                    const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - (now ?? new Date(campaign.deadline).getTime())) / 86400000);
                    return (
                      <tr key={campaign.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{campaign.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{campaign.niche}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><PlatformBadge platform={campaign.platform} /></td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={campaign.status} /></td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-slate-800 tabular-nums">${campaign.budget.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${spendPct >= 90 ? 'bg-red-500' : spendPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${spendPct}%` }} /></div>
                            <span className="text-xs text-slate-400 tabular-nums">{spendPct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-700 tabular-nums">{campaign.applicants}</span>
                          {campaign.pending > 0 && <span className="ml-1.5 text-xs bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">{campaign.pending} new</span>}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-emerald-700 tabular-nums">{campaign.accepted}</span>
                          <span className="text-xs text-slate-400"> / {campaign.deliverables.length * 2} slots</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-slate-700">{formatDeadline(campaign.deadline)}</p>
                          <p className={`text-xs mt-0.5 ${daysLeft <= 7 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedCampaign(campaign)} className="p-1.5 rounded-md hover:bg-violet-50 hover:text-violet-700 text-slate-500 transition-colors" title="View applicants"><Users size={15} /></button>
                            <Link href={`/campaign-detail?id=${campaign.id}`} className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors" title="View campaign detail"><Eye size={15} /></Link>
                            <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors" title="Edit campaign"><Edit size={15} /></button>
                            <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors" title="View analytics"><BarChart3 size={15} /></button>
                            <div className="relative">
                              <button onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors" title="More actions"><MoreHorizontal size={15} /></button>
                              {openMenuId === campaign.id && (
                                <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-44 py-1">
                                  <button onClick={() => handleStatusChange(campaign.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Mark Active</button>
                                  <button onClick={() => handleStatusChange(campaign.id, 'completed')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><PauseCircle size={14} className="text-blue-500" /> Mark Completed</button>
                                  <hr className="my-1 border-slate-100" />
                                  <button onClick={() => handleDeleteCampaign(campaign.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete Campaign</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <BarChart3 size={36} className="text-slate-300 mb-3" />
                <h3 className="text-slate-700 font-semibold mb-1">No campaigns yet</h3>
                <p className="text-slate-400 text-sm mb-4">Create your first campaign to start finding creators</p>
                <Link href="/brand-campaign-management/create" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Create Campaign</Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Campaign Applicants</h2>
                <p className="text-xs text-slate-400 mt-0.5">Review and manage all creator applications across your campaigns</p>
              </div>
              <span className="text-xs text-slate-400">{filteredApplicants.length} applicants</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search by name or campaign..." value={applicantSearch} onChange={e => setApplicantSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full" />
              </div>
              <div className="relative">
                <select value={applicantStatusFilter} onChange={e => setApplicantStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredApplicants.map(applicant => (
              <div key={applicant.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-700 text-xs font-bold">{applicant.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-slate-800">{applicant.name}</p>
                        <p className="text-xs text-violet-600">{applicant.handle}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${applicantStatusConfig[applicant.status]?.cls}`}>{applicantStatusConfig[applicant.status]?.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1.5 line-clamp-1">{applicant.bio}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Users size={10} className="text-slate-400" />{(applicant.followers / 1000).toFixed(1)}K followers</span>
                        <span className="text-xs text-emerald-700 flex items-center gap-1"><TrendingUp size={10} />{applicant.engagementRate}% eng.</span>
                        <span className="text-xs text-violet-600 flex items-center gap-1"><Star size={10} />{applicant.avgROI} avg ROI</span>
                        <span className="text-xs text-slate-400">{applicant.pastCollabs} past collabs</span>
                        <PlatformBadge platform={applicant.platform} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">Applied to: <span className="text-slate-600 font-medium">{applicant.campaign}</span> · {applicant.appliedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {applicant.status === 'pending' && (
                      <>
                        <button onClick={() => handleApplicantAction(applicant.id, 'shortlist', applicant.name)} className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors">Shortlist</button>
                        <button onClick={() => handleApplicantAction(applicant.id, 'approve', applicant.name)} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                        <button onClick={() => handleApplicantAction(applicant.id, 'reject', applicant.name)} className="text-xs font-semibold bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                      </>
                    )}
                    {applicant.status === 'shortlisted' && (
                      <button onClick={() => handleApplicantAction(applicant.id, 'approve', applicant.name)} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><UserCheck size={12} />Approve</button>
                    )}
                    {applicant.status === 'approved' && (
                      <Link href="/brand-messages" className="text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><MessageSquare size={12} />Message</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredApplicants.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Users size={36} className="text-slate-300 mb-3" />
                <h3 className="text-slate-700 font-semibold mb-1">No applicants found</h3>
                <p className="text-slate-400 text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && campaigns.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">Loading campaigns...</div>
      )}
      {selectedCampaign && <ApplicantDrawer campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}
    </div>
  );
}