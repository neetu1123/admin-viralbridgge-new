'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Search, ChevronDown, CheckCircle, XCircle, Flag, Eye, Pause, AlertTriangle, X } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

interface AdminCampaign {
  id: string; title: string; brand: string; platform: string; budget: number;
  status: 'pending_approval' | 'active' | 'completed' | 'flagged' | 'draft' | 'frozen' | 'rejected';
  applicants: number; createdAt: string; reportCount: number; contentBrief: string;
  creatorsInvolved: string[]; flagReason?: string;
}

const adminCampaigns: AdminCampaign[] = [
  { id: 'camp-001', title: 'Summer Glow Skincare Launch', brand: 'Luminary Skincare', platform: 'Instagram', budget: 6000, status: 'active', applicants: 34, createdAt: '2026-04-01', reportCount: 0, contentBrief: 'Create 3 Reels showcasing the new SPF 50 serum. Authentic skin-care routine content. No heavy filters.', creatorsInvolved: ['Sofia Martinez', 'Aisha Okonkwo'] },
  { id: 'camp-002', title: 'FitPro App — 30-Day Challenge', brand: 'FitPro Health', platform: 'YouTube', budget: 10500, status: 'active', applicants: 18, createdAt: '2026-03-20', reportCount: 0, contentBrief: 'Document a 30-day fitness journey using FitPro app. Include before/after, daily check-ins, and app walkthrough.', creatorsInvolved: ['Jordan Osei', 'Priya Nair'] },
  { id: 'camp-003', title: 'Suspicious Crypto Giveaway', brand: 'SpamBrand LLC', platform: 'Instagram', budget: 500, status: 'flagged', applicants: 142, createdAt: '2026-03-01', reportCount: 8, contentBrief: 'Promote crypto giveaway — ask followers to send 0.01 ETH to receive 0.1 ETH back.', creatorsInvolved: [], flagReason: 'Fraudulent giveaway scheme — 8 user reports, violates financial promotion policy' },
  { id: 'camp-004', title: 'TechDrop Earbuds Review', brand: 'TechDrop', platform: 'YouTube', budget: 6400, status: 'completed', applicants: 52, createdAt: '2026-02-15', reportCount: 2, contentBrief: 'Honest review of TechDrop X3 earbuds. 10-min video, include sound test, comfort, and battery life.', creatorsInvolved: ['Aisha Okonkwo'] },
  { id: 'camp-005', title: 'NomadPay Travel Creator Push', brand: 'NomadPay', platform: 'Instagram', budget: 8000, status: 'pending_approval', applicants: 0, createdAt: '2026-04-12', reportCount: 0, contentBrief: 'Show how NomadPay simplifies international payments while traveling. 2 posts + 5 stories. Must disclose sponsorship.', creatorsInvolved: [] },
  { id: 'camp-006', title: 'StyleForward Fall Collection', brand: 'StyleForward', platform: 'Instagram', budget: 10800, status: 'pending_approval', applicants: 0, createdAt: '2026-04-13', reportCount: 0, contentBrief: 'Style 3 outfits from the Fall 2026 collection. GRWM format preferred. Tag @styleforward in all posts.', creatorsInvolved: [] },
  { id: 'camp-007', title: 'GameVault Pro Controller', brand: 'GameVault', platform: 'TikTok', budget: 5400, status: 'active', applicants: 88, createdAt: '2026-03-28', reportCount: 1, contentBrief: 'Unboxing + gameplay session with GameVault Pro Controller. Show responsiveness, ergonomics, and RGB lighting.', creatorsInvolved: ['Marcus Webb'] },
  { id: 'camp-008', title: 'EcoBottle Zero-Waste Push', brand: 'EcoBottle', platform: 'TikTok', budget: 3200, status: 'frozen', applicants: 12, createdAt: '2026-04-05', reportCount: 0, contentBrief: 'Promote EcoBottle as a sustainable alternative. Show daily use, refill stations, and environmental impact stats.', creatorsInvolved: ['Mei-Lin Chen'], flagReason: 'Frozen pending payment dispute resolution' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending_approval: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  flagged: { label: 'Flagged', cls: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  frozen: { label: 'Frozen', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border border-red-300' },
};

export default function AdminCampaignsContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailCampaign, setDetailCampaign] = useState<AdminCampaign | null>(null);

  const filtered = adminCampaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = adminCampaigns.filter(c => c.status === 'pending_approval').length;
  const flagged = adminCampaigns.filter(c => c.status === 'flagged').length;
  const active = adminCampaigns.filter(c => c.status === 'active').length;
  const frozen = adminCampaigns.filter(c => c.status === 'frozen').length;

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaign Moderation</h1>
          <p className="text-slate-500 text-sm mt-1">Review, approve, flag, and manage all platform campaigns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Approval', value: pending, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Flagged', value: flagged, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'Active', value: active, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Frozen', value: frozen, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns or brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white w-full"
            />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
              <option value="all">All Statuses</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="flagged">Flagged</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="frozen">Frozen</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Campaign', 'Brand', 'Platform', 'Budget', 'Status', 'Applicants', 'Reports', 'Actions'].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(campaign => (
                <tr key={campaign.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{campaign.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Created {campaign.createdAt}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{campaign.brand}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <PlatformBadge platform={campaign.platform} />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-800 tabular-nums">${campaign.budget.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig[campaign.status]?.cls}`}>
                      {statusConfig[campaign.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700 tabular-nums">{campaign.applicants}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {campaign.reportCount > 0 ? (
                      <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">{campaign.reportCount} reports</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setDetailCampaign(campaign)} className="p-1.5 rounded-md hover:bg-violet-50 hover:text-violet-700 text-slate-500 transition-colors" title="View details"><Eye size={14} /></button>
                      {campaign.status === 'pending_approval' && (
                        <>
                          <button onClick={() => toast.success(`Campaign approved: ${campaign.title}`)} className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors" title="Approve"><CheckCircle size={14} /></button>
                          <button onClick={() => toast.error(`Campaign rejected: ${campaign.title}`)} className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-500 transition-colors" title="Reject"><XCircle size={14} /></button>
                        </>
                      )}
                      {campaign.status === 'active' && (
                        <button onClick={() => toast.warning(`Campaign frozen: ${campaign.title}`)} className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors" title="Freeze"><Pause size={14} /></button>
                      )}
                      {campaign.status === 'flagged' && (
                        <button onClick={() => toast.success(`Flag removed: ${campaign.title}`)} className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-500 transition-colors" title="Remove flag"><Flag size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailCampaign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{detailCampaign.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{detailCampaign.brand} · ${detailCampaign.budget.toLocaleString()}</p>
              </div>
              <button onClick={() => setDetailCampaign(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={16} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Content Brief</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{detailCampaign.contentBrief}</p>
              </div>
              {detailCampaign.flagReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-600" />
                    <p className="text-xs font-semibold text-red-700">Flag Reason</p>
                  </div>
                  <p className="text-sm text-red-700">{detailCampaign.flagReason}</p>
                </div>
              )}
              {detailCampaign.creatorsInvolved.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Creators Involved</p>
                  <div className="flex flex-wrap gap-2">
                    {detailCampaign.creatorsInvolved.map(c => (
                      <span key={c} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {detailCampaign.status === 'pending_approval' && (
                  <>
                    <button onClick={() => { toast.success('Campaign approved'); setDetailCampaign(null); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">Approve</button>
                    <button onClick={() => { toast.error('Campaign rejected'); setDetailCampaign(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">Reject</button>
                  </>
                )}
                {detailCampaign.status === 'flagged' && (
                  <>
                    <button onClick={() => { toast.success('Campaign approved after review'); setDetailCampaign(null); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">Approve</button>
                    <button onClick={() => { toast.error('Campaign removed'); setDetailCampaign(null); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">Remove</button>
                  </>
                )}
                <button onClick={() => setDetailCampaign(null)} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
