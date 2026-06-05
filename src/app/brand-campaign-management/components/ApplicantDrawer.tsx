'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, CheckCircle, XCircle, MessageSquare, TrendingUp, Users, Star, ExternalLink } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import Link from 'next/link';
import { brandApi } from '@/src/lib/api';

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
  status: 'pending' | 'accepted' | 'rejected' | 'shortlisted';
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

interface ApplicantDrawerProps {
  campaign: Campaign;
  onClose: () => void;
}

function mapStatus(status: string): Applicant['status'] {
  const normalized = status.toUpperCase();
  if (normalized === 'ACCEPTED') return 'accepted';
  if (normalized === 'REJECTED') return 'rejected';
  if (normalized === 'SHORTLISTED') return 'shortlisted';
  return 'pending';
}

function mapApplicant(raw: any): Applicant {
  const creator = raw.creator ?? {};
  const user = creator.user ?? {};
  const social = (creator.social_links as Record<string, string>) ?? {};
  const handle = social.instagram || social.youtube || social.tiktok || user.email || '@creator';

  return {
    id: raw.id,
    name: creator.full_name || user.name || 'Creator',
    handle: handle.startsWith('@') ? handle : `@${handle.replace('@', '')}`,
    avatar: (creator.full_name || user.name || 'CR').slice(0, 2).toUpperCase(),
    niche: creator.niche || 'General',
    followers: creator.followers ?? 0,
    engagementRate: creator.engagement_rate ?? 0,
    platform: raw.campaign?.platform || 'Instagram',
    message: raw.message || '',
    proposedPrice: raw.proposed_price ?? null,
    status: mapStatus(raw.status),
    appliedAt: raw.created_at?.slice(0, 10) ?? '',
    rating: 4.5,
    pastCollabs: 0,
  };
}

export default function ApplicantDrawer({ campaign, onClose }: ApplicantDrawerProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [appStatuses, setAppStatuses] = useState<Record<string, Applicant['status']>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('all');

  useEffect(() => {
    brandApi
      .getApplicants(campaign.id)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        const mapped = list.map(mapApplicant);
        setApplicants(mapped);
        setAppStatuses(Object.fromEntries(mapped.map((a) => [a.id, a.status])));
      })
      .catch((error: Error) => toast.error(error.message || 'Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [campaign.id]);

  const handleDecision = async (appId: string, decision: 'accepted' | 'rejected') => {
    try {
      if (decision === 'accepted') {
        await brandApi.approveApplication(appId);
      } else {
        await brandApi.rejectApplication(appId);
      }
      setAppStatuses((prev) => ({ ...prev, [appId]: decision }));
      const name = applicants.find((a) => a.id === appId)?.name;
      if (decision === 'accepted') {
        toast.success(`${name} accepted — escrow funds will be allocated`);
      } else {
        toast.info(`${name}'s application rejected`);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const filtered = applicants.filter((a) => {
    if (activeTab === 'all') return true;
    return appStatuses[a.id] === activeTab;
  });

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => appStatuses[a.id] === 'pending' || appStatuses[a.id] === 'shortlisted').length,
    accepted: applicants.filter((a) => appStatuses[a.id] === 'accepted').length,
    rejected: applicants.filter((a) => appStatuses[a.id] === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-card-lg animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
