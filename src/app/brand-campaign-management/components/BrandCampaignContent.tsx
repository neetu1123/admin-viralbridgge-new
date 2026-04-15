'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Plus, Search, ChevronDown, MoreHorizontal, Users, DollarSign, TrendingUp, Eye, Edit, Trash2, PauseCircle, CheckCircle, BarChart3 } from 'lucide-react';
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

export default function BrandCampaignContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = campaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalApplicants = campaigns.reduce((s, c) => s + c.applicants, 0);
  const totalAccepted = campaigns.reduce((s, c) => s + c.accepted, 0);

  const handleStatusChange = (campaignId: string, newStatus: string) => {
    // BACKEND: PATCH /api/campaigns/:id { status: newStatus }
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
          <p className="text-slate-500 text-sm mt-1">Manage your influencer campaigns and review applicants</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150"
        >
          <Plus size={16} />
          Create Campaign
        </button>
      </div>

      {/* KPI cards — 4 cards, 4-col grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Campaign Budget', value: `$${totalBudget.toLocaleString()}`, sub: `$${totalSpent.toLocaleString()} spent`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Applicants', value: totalApplicants.toString(), sub: `${totalAccepted} accepted`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').toString(), sub: `${campaigns.filter(c => c.status === 'in_progress').length} in progress`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Reviews', value: campaigns.reduce((s, c) => s + c.pending, 0).toString(), sub: 'applications awaiting review', icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(card => (
          <div key={`kpi-${card.label}`} className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 mb-6">
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card">
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
                const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000);

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
                        <span className="ml-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">{campaign.pending} new</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-emerald-700 tabular-nums">{campaign.accepted}</span>
                      <span className="text-xs text-slate-400"> / {campaign.deliverables.length * 2} slots</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-slate-700">{new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
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
                        <button
                          className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
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
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-card-lg z-20 w-44 py-1 animate-fade-in">
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