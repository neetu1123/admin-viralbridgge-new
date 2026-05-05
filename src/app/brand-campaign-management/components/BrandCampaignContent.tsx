'use client';
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { Plus, Search, ChevronDown, MoreHorizontal, Users, DollarSign, TrendingUp, Eye, Edit, Trash2, PauseCircle, CheckCircle, BarChart3, Zap, MessageSquare, Star, ArrowRight, Sparkles, AlertCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import CreateCampaignModal from './CreateCampaignModal';
import ApplicantDrawer from './ApplicantDrawer';
import CampaignStatsChart from './CampaignStatsChart';

interface Campaign {
  id: string;
  title: string;
  platform: string;
  niche: string;
  budget: number;
  spent: number;
  deadline: string;
  status: 'active' | 'draft' | 'completed' | 'in_progress';
  applicants: number;
  accepted: number;
  pending: number;
  deliverables: string[];
  createdAt: string;
}

const campaigns: Campaign[] = [
  { id: 'camp-b001', title: 'Summer Glow Skincare Launch', platform: 'Instagram', niche: 'Beauty & Skincare', budget: 6000, spent: 2400, deadline: '2026-05-01', status: 'active', applicants: 34, accepted: 2, pending: 8, deliverables: ['2 Feed Posts', '4 Stories', '1 Reel'], createdAt: '2026-04-01' },
  { id: 'camp-b002', title: 'FitPro App — 30-Day Challenge', platform: 'YouTube', niche: 'Fitness & Wellness', budget: 10500, spent: 7000, deadline: '2026-05-15', status: 'in_progress', applicants: 18, accepted: 2, pending: 1, deliverables: ['1 Long-form Video', '2 Shorts'], createdAt: '2026-03-20' },
  { id: 'camp-b003', title: 'Fall Collection Drop — StyleForward', platform: 'Instagram', niche: 'Fashion & Style', budget: 10800, spent: 0, deadline: '2026-05-10', status: 'draft', applicants: 0, accepted: 0, pending: 0, deliverables: ['2 Posts', '5 Stories', '1 Reel'], createdAt: '2026-04-10' },
  { id: 'camp-b004', title: 'TechDrop Q1 Earbuds Campaign', platform: 'YouTube', niche: 'Tech & Gadgets', budget: 6400, spent: 6400, deadline: '2026-03-31', status: 'completed', applicants: 52, accepted: 8, pending: 0, deliverables: ['1 Unboxing', '1 Review'], createdAt: '2026-02-15' },
  { id: 'camp-b005', title: 'NomadPay Travel Creator Push', platform: 'Instagram', niche: 'Travel & Adventure', budget: 8000, spent: 4000, deadline: '2026-05-20', status: 'active', applicants: 27, accepted: 2, pending: 6, deliverables: ['3 Posts', '6 Stories', 'Bio Link'], createdAt: '2026-04-05' },
];

const aiRecommendedCreators = [
  { id: 'rec-001', name: 'Sofia Martinez', handle: '@sofiaglows', avatar: 'SM', niche: 'Beauty & Skincare', followers: 48200, engagementRate: 5.2, matchScore: 97, reason: 'Perfect niche match + high engagement', platform: 'Instagram' },
  { id: 'rec-002', name: 'Priya Nair', handle: '@priyabeauty', avatar: 'PN', niche: 'Beauty & Skincare', followers: 92100, engagementRate: 4.1, matchScore: 94, reason: 'Large audience in your target demographic', platform: 'Instagram' },
  { id: 'rec-003', name: 'Mei-Lin Chen', handle: '@meilinskin', avatar: 'MC', niche: 'Beauty & Skincare', followers: 22800, engagementRate: 7.3, matchScore: 91, reason: 'Micro-influencer with exceptional ROI history', platform: 'Instagram' },
  { id: 'rec-004', name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', niche: 'Lifestyle', followers: 31500, engagementRate: 6.8, matchScore: 88, reason: 'Highly engaged niche community', platform: 'Instagram' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDeadline(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

export default function BrandCampaignContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const filtered = campaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalPending = campaigns.reduce((s, c) => s + c.pending, 0);
  const budgetUsedPct = Math.round((totalSpent / totalBudget) * 100);
  const bestCampaign = campaigns.find(c => c.id === 'camp-b004');

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    toast.success(`Campaign status updated to ${newStatus}`);
    setOpenMenuId(null);
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Management</h1>
          <p className="text-slate-500 text-sm mt-1">Decision-focused dashboard — act on what matters most</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150 shadow-sm"
        >
          <Plus size={16} />
          Create Campaign
        </button>
      </div>

      {/* Decision-Focused KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Budget Utilization */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Utilization</p>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <DollarSign size={15} className="text-violet-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800 tabular-nums mb-1">
            ${totalSpent.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ ${totalBudget.toLocaleString()}</span>
          </p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${budgetUsedPct >= 85 ? 'bg-red-500' : budgetUsedPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <p className={`text-xs font-medium tabular-nums ${budgetUsedPct >= 85 ? 'text-red-600' : budgetUsedPct >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {budgetUsedPct}% used
          </p>
        </div>

        {/* Campaign Performance Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Performance Score</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-1">
            <p className="text-xl font-bold text-emerald-700 tabular-nums">84</p>
            <span className="text-xs text-slate-400 mb-1">/ 100</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: '84%' }} />
          </div>
          <p className="text-xs text-emerald-600 font-medium">↑ +6 pts from last month</p>
        </div>

        {/* Top Performing Campaign */}
        <div className="bg-white rounded-xl border border-violet-200 ring-1 ring-violet-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Best Campaign</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Trophy size={15} className="text-amber-500" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-tight mb-1 line-clamp-1">TechDrop Q1 Earbuds</p>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">ROI: 3.2x</span>
          </div>
          <p className="text-xs text-slate-400">52 applicants · 8 accepted</p>
        </div>

        {/* Pending Actions — Urgent */}
        <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${totalPending > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Actions</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalPending > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
              <AlertCircle size={15} className={totalPending > 0 ? 'text-red-500' : 'text-slate-400'} />
            </div>
          </div>
          <p className={`text-xl font-bold tabular-nums mb-1 ${totalPending > 0 ? 'text-red-600' : 'text-slate-800'}`}>{totalPending}</p>
          <p className="text-xs text-slate-500 mb-1.5">creators awaiting approval</p>
          {totalPending > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
              ● Needs attention
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-xl p-4 mb-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Zap size={16} className="text-violet-200" />
            <span className="text-sm font-semibold">Quick Actions</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('active')}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 border border-white/20"
            >
              <Users size={13} />
              Approve Applicants
              {totalPending > 0 && (
                <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalPending}</span>
              )}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 border border-white/20"
            >
              <Plus size={13} />
              Create Campaign
            </button>
            <Link
              href="/messaging-inbox"
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 border border-white/20"
            >
              <MessageSquare size={13} />
              Message Creators
            </Link>
            <Link
              href="/creator-discovery"
              className="flex items-center gap-1.5 bg-white text-violet-700 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150 hover:bg-violet-50"
            >
              <Star size={13} />
              View Top Creators
            </Link>
          </div>
        </div>
      </div>

      {/* AI Recommended Creators */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Sparkles size={15} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">AI Recommended Creators</h2>
              <p className="text-xs text-slate-400 mt-0.5">Matched to your active campaigns by niche, budget & performance</p>
            </div>
          </div>
          <Link href="/creator-discovery" className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {aiRecommendedCreators.map(creator => (
            <div key={creator.id} className="border border-slate-100 rounded-xl p-3.5 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150 group">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-700 text-xs font-bold">{creator.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{creator.name}</p>
                  <p className="text-xs text-violet-600 truncate">{creator.handle}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">{creator.matchScore}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users size={10} className="text-slate-400" />
                  {(creator.followers / 1000).toFixed(1)}K
                </span>
                <span className="text-xs text-emerald-700 flex items-center gap-1">
                  <TrendingUp size={10} />
                  {creator.engagementRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{creator.reason}</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => toast.success(`Invite sent to ${creator.name}`)}
                  className="flex-1 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white py-1.5 rounded-lg transition-colors"
                >
                  Invite
                </button>
                <Link
                  href="/messaging-inbox"
                  className="flex-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg transition-colors text-center"
                >
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
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
        <CampaignStatsChart onClose={() => console.log('empty')} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-56"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700"
              >
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
                  <th key={`th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
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
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <PlatformBadge platform={campaign.platform} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800 tabular-nums">${campaign.budget.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${spendPct >= 90 ? 'bg-red-500' : spendPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 tabular-nums">{spendPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">{campaign.applicants}</span>
                      {campaign.pending > 0 && (
                        <span className="ml-1.5 text-xs bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">{campaign.pending} new</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-emerald-700 tabular-nums">{campaign.accepted}</span>
                      <span className="text-xs text-slate-400"> / {campaign.deliverables.length * 2} slots</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{formatDeadline(campaign.deadline)}</p>
                      <p className={`text-xs mt-0.5 ${daysLeft <= 7 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="p-1.5 rounded-md hover:bg-violet-50 hover:text-violet-700 text-slate-500 transition-colors"
                          title="View applicants"
                        >
                          <Users size={15} />
                        </button>
                        <Link
                          href={`/campaign-detail?id=${campaign.id}`}
                          className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                          title="View campaign detail"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                          title="Edit campaign"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                          title="View analytics"
                        >
                          <BarChart3 size={15} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                            title="More actions"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenuId === campaign.id && (
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-44 py-1 animate-fade-in">
                              <button onClick={() => handleStatusChange(campaign.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <CheckCircle size={14} className="text-emerald-500" /> Mark Active
                              </button>
                              <button onClick={() => handleStatusChange(campaign.id, 'completed')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <PauseCircle size={14} className="text-blue-500" /> Mark Completed
                              </button>
                              <hr className="my-1 border-slate-100" />
                              <button onClick={() => { toast.error('Campaign deleted'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 size={14} /> Delete Campaign
                              </button>
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
            <button onClick={() => setShowCreate(true)} className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
              Create Campaign
            </button>
          </div>
        )}
      </div>

      {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} />}
      {selectedCampaign && <ApplicantDrawer campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}
    </div>
  );
}