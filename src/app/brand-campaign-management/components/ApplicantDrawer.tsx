'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, CheckCircle, XCircle, MessageSquare, TrendingUp, Users, Star, ExternalLink } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Link from 'next/link';

interface Applicant {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  followers: number;
  engagementRate: number;
  platform: string;
  message: string;
  proposedPrice: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  rating: number;
  pastCollabs: number;
}

interface Campaign {
  id: string;
  title: string;
  budget: number;
  platform: string;
}

const applicants: Applicant[] = [
  { id: 'app-001', name: 'Sofia Martinez', handle: '@sofiaglows', avatar: 'SM', niche: 'Beauty & Skincare', followers: 48200, engagementRate: 5.2, platform: 'Instagram', message: "Hi! I've been using skincare products for 5 years and my audience trusts my honest reviews. I have worked with 8 beauty brands with an avg 4.8% engagement on sponsored posts.", proposedPrice: 1100, status: 'pending', appliedAt: '2026-04-12', rating: 4.8, pastCollabs: 8 },
  { id: 'app-002', name: 'Priya Nair', handle: '@priyabeauty', avatar: 'PN', niche: 'Beauty & Skincare', followers: 92100, engagementRate: 4.1, platform: 'Instagram', message: "My audience is 78% female aged 22-35 — your perfect demographic. I create aesthetic, high-quality content that drives real conversions.", proposedPrice: 1500, status:'pending', appliedAt: '2026-04-11', rating: 4.5, pastCollabs: 12 },
  { id: 'app-003', name: 'Aisha Okonkwo', handle: '@aishaskin', avatar: 'AO', niche: 'Beauty & Skincare', followers: 31500, engagementRate: 6.8, platform: 'Instagram', message: "I specialize in skincare routines for melanin-rich skin. My community is highly engaged and actively asks for product recommendations.", proposedPrice: null, status: 'accepted', appliedAt: '2026-04-10', rating: 4.9, pastCollabs: 5 },
  { id: 'app-004', name: 'Mei-Lin Chen', handle: '@meilinskin', avatar: 'MC', niche: 'Beauty & Skincare', followers: 22800, engagementRate: 7.3, platform: 'Instagram', message: "Micro-influencer with extremely loyal following. My last 3 brand deals resulted in 200%+ sell-through on promoted products.", proposedPrice: 900, status: 'pending', appliedAt: '2026-04-13', rating: 4.7, pastCollabs: 3 },
  { id: 'app-005', name: 'Daniela Rossi', handle: '@danielaglam', avatar: 'DR', niche: 'Beauty & Skincare', followers: 156000, engagementRate: 2.9, platform: 'Instagram', message: "Large audience, great reach for brand awareness campaigns. I post consistently and deliver on time.", proposedPrice: 2200, status: 'rejected', appliedAt: '2026-04-09', rating: 3.9, pastCollabs: 22 },
  { id: 'app-006', name: 'Yuki Tanaka', handle: '@yukibeauty', avatar: 'YT', niche: 'Beauty & Skincare', followers: 67400, engagementRate: 4.6, platform: 'Instagram', message: "Japanese skincare enthusiast with a global audience. I blend J-beauty techniques with Western products — very unique content angle.", proposedPrice: 1300, status: 'pending', appliedAt: '2026-04-13', rating: 4.6, pastCollabs: 7 },
];

interface ApplicantDrawerProps {
  campaign: Campaign;
  onClose: () => void;
}

export default function ApplicantDrawer({ campaign, onClose }: ApplicantDrawerProps) {
  const [appStatuses, setAppStatuses] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>(
    Object.fromEntries(applicants.map(a => [a.id, a.status]))
  );
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('all');

  const handleDecision = (appId: string, decision: 'accepted' | 'rejected') => {
    // BACKEND: PATCH /api/applications/:id { status: decision }
    setAppStatuses(prev => ({ ...prev, [appId]: decision }));
    const name = applicants.find(a => a.id === appId)?.name;
    if (decision === 'accepted') {
      toast.success(`${name} accepted — escrow funds will be allocated`);
    } else {
      toast.info(`${name}'s application rejected`);
    }
  };

  const filtered = applicants.filter(a => {
    if (activeTab === 'all') return true;
    return appStatuses[a.id] === activeTab;
  });

  const counts = {
    all: applicants.length,
    pending: applicants.filter(a => appStatuses[a.id] === 'pending').length,
    accepted: applicants.filter(a => appStatuses[a.id] === 'accepted').length,
    rejected: applicants.filter(a => appStatuses[a.id] === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-card-lg animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Applicants</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map(tab => (
            <button
              key={`drawer-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === tab ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Applicant list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium">No {activeTab === 'all' ? '' : activeTab} applicants</p>
            </div>
          ) : (
            filtered.map(applicant => {
              const currentStatus = appStatuses[applicant.id];
              return (
                <div key={applicant.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-700 text-xs font-bold">{applicant.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{applicant.name}</p>
                          <StatusBadge status={currentStatus} />
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(applicant.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-violet-600 font-medium mb-2">{applicant.handle}</p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Users size={11} className="text-slate-400" />
                          <span className="tabular-nums font-medium">{(applicant.followers / 1000).toFixed(1)}K</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <TrendingUp size={11} className={applicant.engagementRate >= 4 ? 'text-emerald-500' : 'text-amber-500'} />
                          <span className={`tabular-nums font-medium ${applicant.engagementRate >= 4 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {applicant.engagementRate}%
                          </span>
                          <span className="text-slate-400">eng.</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="tabular-nums font-medium">{applicant.rating}</span>
                        </span>
                        <span className="text-xs text-slate-500">{applicant.pastCollabs} collabs</span>
                      </div>

                      {/* Proposed price */}
                      {applicant.proposedPrice && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs text-slate-500">Proposed:</span>
                          <span className={`text-xs font-semibold tabular-nums ${applicant.proposedPrice > campaign.budget ? 'text-red-600' : 'text-emerald-700'}`}>
                            ${applicant.proposedPrice.toLocaleString()}
                          </span>
                          {applicant.proposedPrice > campaign.budget && (
                            <span className="text-xs text-red-500">(over budget)</span>
                          )}
                        </div>
                      )}

                      {/* Message */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3 bg-slate-50 rounded-lg p-2.5 italic">
                        &ldquo;{applicant.message}&rdquo;
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {currentStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleDecision(applicant.id, 'accepted')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleDecision(applicant.id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                        <Link
                          href="/messaging-inbox"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <MessageSquare size={13} /> Message
                        </Link>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-medium transition-colors hover:bg-slate-100">
                          <ExternalLink size={13} /> Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}