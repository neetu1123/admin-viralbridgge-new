'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Users, DollarSign, Calendar, TrendingUp, Star, CreditCard } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';

type Tab = 'overview' | 'applicants' | 'approved' | 'deliverables' | 'payments';

const campaign = {
  id: 'camp-b001',
  title: 'Summer Glow Skincare Launch',
  platform: 'Instagram',
  niche: 'Beauty & Skincare',
  budget: 6000,
  spent: 2400,
  deadline: '2026-05-01',
  status: 'active' as const,
  applicants: 34,
  accepted: 2,
  pending: 8,
  description: 'We are launching our new Summer Glow serum and need authentic creators to showcase their skincare routine using our products. Looking for creators with engaged beauty audiences who can create genuine, relatable content.',
  deliverables: ['2 Feed Posts', '4 Stories', '1 Reel'],
  createdAt: '2026-04-01',
  roi: '2.1x',
  reach: '142,000',
  impressions: '380,000',
};

const applicants = [
  { id: 'app-001', name: 'Sofia Martinez', handle: '@sofiaglows', avatar: 'SM', followers: 48200, engagementRate: 5.2, proposedPrice: 1100, status: 'pending' as const, appliedAt: '2026-04-12', rating: 4.8, message: "Hi! I\'ve been using skincare products for 5 years and my audience trusts my honest reviews." },
  { id: 'app-002', name: 'Priya Nair', handle: '@priyabeauty', avatar: 'PN', followers: 92100, engagementRate: 4.1, proposedPrice: 1500, status: 'pending' as const, appliedAt: '2026-04-11', rating: 4.5, message: "My audience is 78% female aged 22-35 — your perfect demographic." },
  { id: 'app-003', name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', followers: 31500, engagementRate: 6.8, proposedPrice: null, status: 'accepted' as const, appliedAt: '2026-04-10', rating: 4.9, message: "I specialize in skincare routines for melanin-rich skin." },
  { id: 'app-004', name: 'Mei-Lin Chen', handle: '@meilinskin', avatar: 'MC', followers: 22800, engagementRate: 7.3, proposedPrice: 900, status: 'pending' as const, appliedAt: '2026-04-13', rating: 4.7, message: "Micro-influencer with extremely loyal following." },
  { id: 'app-005', name: 'Daniela Rossi', handle: '@danielaglam', avatar: 'DR', followers: 156000, engagementRate: 2.9, proposedPrice: 2200, status: 'rejected' as const, appliedAt: '2026-04-09', rating: 3.9, message: "Large audience, great reach for brand awareness campaigns." },
];

const approvedCreators = [
  { id: 'app-003', name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', followers: 31500, engagementRate: 6.8, agreedPrice: 1000, deliverablesDone: 2, deliverablesTotal: 3, paymentStatus: 'partial' as const },
  { id: 'app-006', name: 'Yuki Tanaka', handle: '@yukibeauty', avatar: 'YT', followers: 67400, engagementRate: 4.6, agreedPrice: 1300, deliverablesDone: 0, deliverablesTotal: 3, paymentStatus: 'pending' as const },
];

const deliverables = [
  { id: 'del-001', creator: 'Aisha Okonkwo', type: '2 Feed Posts', status: 'completed' as const, dueDate: '2026-04-20', submittedAt: '2026-04-19', notes: 'Excellent quality, on-brand content' },
  { id: 'del-002', creator: 'Aisha Okonkwo', type: '4 Stories', status: 'completed' as const, dueDate: '2026-04-22', submittedAt: '2026-04-21', notes: '' },
  { id: 'del-003', creator: 'Aisha Okonkwo', type: '1 Reel', status: 'in_review' as const, dueDate: '2026-04-28', submittedAt: '2026-04-27', notes: '' },
  { id: 'del-004', creator: 'Yuki Tanaka', type: '2 Feed Posts', status: 'pending' as const, dueDate: '2026-04-25', submittedAt: null, notes: '' },
  { id: 'del-005', creator: 'Yuki Tanaka', type: '4 Stories', status: 'pending' as const, dueDate: '2026-04-27', submittedAt: null, notes: '' },
  { id: 'del-006', creator: 'Yuki Tanaka', type: '1 Reel', status: 'pending' as const, dueDate: '2026-04-30', submittedAt: null, notes: '' },
];

const payments = [
  { id: 'pay-001', creator: 'Aisha Okonkwo', amount: 500, type: 'Milestone 1', status: 'released' as const, date: '2026-04-20' },
  { id: 'pay-002', creator: 'Aisha Okonkwo', amount: 500, type: 'Milestone 2', status: 'in_escrow' as const, date: '2026-04-28' },
  { id: 'pay-003', creator: 'Yuki Tanaka', amount: 1300, type: 'Full Payment', status: 'pending' as const, date: '2026-05-01' },
];

const deliverableStatusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-slate-50 text-slate-600 border-slate-200',
};

const paymentStatusColors: Record<string, string> = {
  released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_escrow: 'bg-amber-50 text-amber-700 border-amber-200',
  partial: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function CampaignDetailContent() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [appStatuses, setAppStatuses] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>(
    Object.fromEntries(applicants.map(a => [a.id, a.status]))
  );

  const handleDecision = (appId: string, decision: 'accepted' | 'rejected') => {
    setAppStatuses(prev => ({ ...prev, [appId]: decision }));
    const name = applicants.find(a => a.id === appId)?.name;
    if (decision === 'accepted') toast.success(`${name} accepted — escrow funds allocated`);
    else toast.info(`${name}'s application rejected`);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'applicants', label: 'Applicants', count: applicants.filter(a => appStatuses[a.id] === 'pending').length },
    { id: 'approved', label: 'Approved Creators', count: approvedCreators.length },
    { id: 'deliverables', label: 'Deliverables', count: deliverables.filter(d => d.status === 'in_review').length },
    { id: 'payments', label: 'Payment Status' },
  ];

  const spendPct = Math.round((campaign.spent / campaign.budget) * 100);

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      {/* Back + Header */}
      <div className="mb-6">
        <Link href="/brand-campaign-management" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} />
          Back to Campaigns
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="flex items-center gap-3">
              <PlatformBadge platform={campaign.platform} />
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{campaign.niche}</span>
              <span className="text-xs text-slate-400">Created {new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <MessageSquare size={14} />
              Message All
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Used</p>
                <DollarSign size={15} className="text-violet-600" />
              </div>
              <p className="text-xl font-bold text-slate-800 tabular-nums">₹{campaign.spent.toLocaleString()}</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 mb-1">
                <div className={`h-full rounded-full ${spendPct >= 85 ? 'bg-red-500' : spendPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${spendPct}%` }} />
              </div>
              <p className="text-xs text-slate-400">{spendPct}% of ₹{campaign.budget.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Reach</p>
                <Users size={15} className="text-blue-600" />
              </div>
              <p className="text-xl font-bold text-slate-800">{campaign.reach}</p>
              <p className="text-xs text-slate-400 mt-1">{campaign.impressions} impressions</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 ring-1 ring-emerald-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ROI</p>
                <TrendingUp size={15} className="text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-emerald-700">{campaign.roi}</p>
              <p className="text-xs text-emerald-600 mt-1">↑ Above average</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</p>
                <Calendar size={15} className="text-amber-600" />
              </div>
              <p className="text-xl font-bold text-slate-800">{new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                {Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000)}d remaining
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Campaign Brief</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Required Deliverables</p>
              <div className="flex flex-wrap gap-2">
                {campaign.deliverables.map(d => (
                  <span key={d} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg font-medium">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="space-y-3">
          {['pending', 'accepted', 'rejected'].map(statusGroup => {
            const group = applicants.filter(a => appStatuses[a.id] === statusGroup);
            if (group.length === 0) return null;
            return (
              <div key={statusGroup}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">{statusGroup} ({group.length})</p>
                <div className="space-y-3">
                  {group.map(applicant => {
                    const currentStatus = appStatuses[applicant.id];
                    return (
                      <div key={applicant.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-700 text-xs font-bold">{applicant.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">{applicant.name}</p>
                                <StatusBadge status={currentStatus} />
                              </div>
                              <span className="text-xs text-slate-400">{new Date(applicant.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <p className="text-xs text-violet-600 font-medium mb-2">{applicant.handle}</p>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-600"><Users size={11} className="text-slate-400" />{(applicant.followers / 1000).toFixed(1)}K</span>
                              <span className={`flex items-center gap-1 text-xs font-medium ${applicant.engagementRate >= 4 ? 'text-emerald-700' : 'text-amber-700'}`}><TrendingUp size={11} />{applicant.engagementRate}%</span>
                              <span className="flex items-center gap-1 text-xs text-slate-600"><Star size={11} className="text-amber-400 fill-amber-400" />{applicant.rating}</span>
                              {applicant.proposedPrice && (
                                <span className={`text-xs font-semibold tabular-nums ${applicant.proposedPrice > campaign.budget ? 'text-red-600' : 'text-emerald-700'}`}>${applicant.proposedPrice.toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 italic bg-slate-50 rounded-lg p-2.5 mb-3 line-clamp-2">&ldquo;{applicant.message}&rdquo;</p>
                            {currentStatus === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleDecision(applicant.id, 'accepted')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors">
                                  <CheckCircle size={13} /> Accept
                                </button>
                                <button onClick={() => handleDecision(applicant.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors">
                                  <XCircle size={13} /> Reject
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                                  <MessageSquare size={13} /> Message
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approved Creators Tab */}
      {activeTab === 'approved' && (
        <div className="space-y-3">
          {approvedCreators.map(creator => (
            <div key={creator.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-700 text-sm font-bold">{creator.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{creator.name}</p>
                      <p className="text-xs text-violet-600 font-medium">{creator.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 tabular-nums">₹{creator.agreedPrice.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">agreed price</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Deliverables</span>
                        <span className="text-xs font-semibold text-slate-700">{creator.deliverablesDone}/{creator.deliverablesTotal}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(creator.deliverablesDone / creator.deliverablesTotal) * 100}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${paymentStatusColors[creator.paymentStatus]}`}>
                      {creator.paymentStatus === 'partial' ? 'Partially Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Deliverables Tracking</h3>
            <p className="text-xs text-slate-400 mt-0.5">{deliverables.filter(d => d.status === 'completed').length} of {deliverables.length} completed</p>
          </div>
          <div className="divide-y divide-slate-50">
            {deliverables.map(del => (
              <div key={del.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${del.status === 'completed' ? 'bg-emerald-500' : del.status === 'in_review' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{del.type}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{del.creator}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${deliverableStatusColors[del.status]}`}>
                    {del.status === 'in_review' ? 'In Review' : del.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Due {new Date(del.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                {del.status === 'in_review' && (
                  <div className="flex gap-1.5">
                    <button onClick={() => toast.success('Deliverable approved!')} className="text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                    <button onClick={() => toast.info('Revision requested')} className="text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors">Revise</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Budget</p>
              <p className="text-xl font-bold text-slate-800 tabular-nums">₹{campaign.budget.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Released</p>
              <p className="text-xl font-bold text-emerald-700 tabular-nums">₹{payments.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">In Escrow</p>
              <p className="text-xl font-bold text-amber-700 tabular-nums">₹{payments.filter(p => p.status === 'in_escrow').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Payment History</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {payments.map(payment => (
                <div key={payment.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${payment.status === 'released' ? 'bg-emerald-50' : payment.status === 'in_escrow' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <CreditCard size={15} className={payment.status === 'released' ? 'text-emerald-600' : payment.status === 'in_escrow' ? 'text-amber-600' : 'text-slate-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{payment.type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{payment.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 tabular-nums">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${paymentStatusColors[payment.status]}`}>
                    {payment.status === 'released' ? 'Released' : payment.status === 'in_escrow' ? 'In Escrow' : 'Pending'}
                  </span>
                  {payment.status === 'in_escrow' && (
                    <button onClick={() => toast.success('Payment released to creator!')} className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Release
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
