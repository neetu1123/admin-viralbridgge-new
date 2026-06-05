'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Users, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Ban, Search, ArrowUpRight, Eye, Flag, Download, ChevronDown, Activity, Wallet, AlertTriangle, Zap, RefreshCw, Lock, Unlock, RotateCcw, GitMerge, Slash, UserCheck, FileText, Star, ArrowRight, Shield } from 'lucide-react';
import StatusBadge from '@/src/components/ui/StatusBadge';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import AdminPlatformChart from './AdminPlatformChart';
import { adminApi } from '@/src/lib/api';
import { useAuth } from '@/src/lib/useAuth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminTab = 'users' | 'campaigns' | 'transactions' | 'disputes' | 'ai-matching' | 'analytics' | 'withdrawals';

interface AdminUser {
  id: string; name: string; email: string; role: 'creator' | 'brand';
  status: 'active' | 'suspended' | 'pending_kyc' | 'banned' | 'verified';
  kycStatus: 'verified' | 'pending' | 'not_submitted' | 'rejected';
  joinedAt: string; totalEarnings?: number; totalSpend?: number;
  campaigns?: number; collabs?: number; followers?: number; lastActive: string;
  activityLog: { date: string; action: string }[];
}

interface AdminCampaign {
  id: string; title: string; brand: string; platform: string; budget: number;
  status: 'pending_approval' | 'active' | 'completed' | 'flagged' | 'draft' | 'frozen' | 'rejected';
  applicants: number; createdAt: string; reportCount: number; contentBrief: string;
  creatorsInvolved: string[]; flagReason?: string;
}

interface AdminTransaction {
  id: string; type: 'brand_to_escrow' | 'escrow_to_creator' | 'withdrawal' | 'refund' | 'credit';
  from: string; to: string; amount: number;
  paymentStatus: 'held' | 'released' | 'disputed' | 'completed' | 'pending' | 'failed';
  date: string; campaignId?: string; campaignTitle?: string;
}

interface AdminDispute {
  id: string; campaignTitle: string; campaignId: string; creator: string; brand: string;
  reason: string; amount: number; status: 'open' | 'resolved' | 'escalated' | 'refunded';
  openedAt: string; priority: 'high' | 'medium' | 'low';
}

interface AIMatch {
  id: string; campaignTitle: string; campaignId: string; creatorName: string;
  creatorNiche: string; matchScore: number; reasons: string[];
  status: 'active' | 'removed' | 'force_matched'; matchedAt: string;
  engagement: number; followers: number;
}

interface AdminWithdrawal {
  id: string; creator: string; email: string; amount: number; method: string;
  account: string; status: 'pending' | 'approved' | 'rejected'; requestedAt: string; fee: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const adminUsers: AdminUser[] = [
  { id: 'usr-001', name: 'Sofia Martinez', email: 'sofia@Viralbridgge.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2025-11-12', totalEarnings: 8650, collabs: 14, followers: 48200, lastActive: '2026-04-14', activityLog: [{ date: '2026-04-14', action: 'Completed campaign: Summer Glow' }, { date: '2026-04-10', action: 'Withdrew ₹500 via PayPal' }, { date: '2026-04-01', action: 'Applied to 3 campaigns' }] },
  { id: 'usr-002', name: 'NovaSpark Co.', email: 'brand@novaspark.co', role: 'brand', status: 'active', kycStatus: 'verified', joinedAt: '2025-10-08', totalSpend: 42000, campaigns: 8, lastActive: '2026-04-13', activityLog: [{ date: '2026-04-13', action: 'Created campaign: Fall Collection' }, { date: '2026-04-08', action: 'Released payment to Jordan Osei' }] },
  { id: 'usr-003', name: 'Priya Nair', email: 'priya@creators.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2025-12-01', totalEarnings: 5200, collabs: 9, followers: 92100, lastActive: '2026-04-12', activityLog: [{ date: '2026-04-12', action: 'Submitted deliverable for FitPro campaign' }, { date: '2026-04-07', action: 'Requested withdrawal of ₹2,000' }] },
  { id: 'usr-004', name: 'TechDrop', email: 'marketing@techdrop.com', role: 'brand', status: 'suspended', kycStatus: 'pending', joinedAt: '2026-01-15', totalSpend: 12000, campaigns: 3, lastActive: '2026-04-11', activityLog: [{ date: '2026-04-11', action: 'Account suspended: payment dispute' }, { date: '2026-04-05', action: 'Flagged by creator: late payment' }] },
  { id: 'usr-005', name: 'Marcus Webb', email: 'marcus@ugcpro.io', role: 'creator', status: 'pending_kyc', kycStatus: 'not_submitted', joinedAt: '2026-04-10', totalEarnings: 0, collabs: 0, followers: 18500, lastActive: '2026-04-10', activityLog: [{ date: '2026-04-10', action: 'Account created — KYC pending' }] },
  { id: 'usr-006', name: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2026-01-22', totalEarnings: 3100, collabs: 5, followers: 31500, lastActive: '2026-04-09', activityLog: [{ date: '2026-04-09', action: 'Received payment: ₹950' }] },
  { id: 'usr-007', name: 'SpamBrand LLC', email: 'fake@spambrand.xyz', role: 'brand', status: 'banned', kycStatus: 'rejected', joinedAt: '2026-03-01', totalSpend: 0, campaigns: 2, lastActive: '2026-03-05', activityLog: [{ date: '2026-03-05', action: 'Account banned: fraudulent activity' }, { date: '2026-03-03', action: 'Campaign flagged: 8 reports' }] },
  { id: 'usr-008', name: 'Kavya Reddy', email: 'kavya@luminaryskn.com', role: 'brand', status: 'active', kycStatus: 'verified', joinedAt: '2025-09-14', totalSpend: 68000, campaigns: 14, lastActive: '2026-04-14', activityLog: [{ date: '2026-04-14', action: 'Approved 3 creator deliverables' }] },
  { id: 'usr-009', name: 'Jordan Osei', email: 'jordan@fitcreators.io', role: 'creator', status: 'active', kycStatus: 'verified', joinedAt: '2026-02-08', totalEarnings: 4800, collabs: 8, followers: 74200, lastActive: '2026-04-13', activityLog: [{ date: '2026-04-13', action: 'Completed FitPro 30-Day Challenge' }] },
  { id: 'usr-010', name: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', role: 'creator', status: 'suspended', kycStatus: 'pending', joinedAt: '2026-03-20', totalEarnings: 900, collabs: 2, followers: 22800, lastActive: '2026-04-08', activityLog: [{ date: '2026-04-08', action: 'Account suspended: withdrawal failed (3x)' }] },
];

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

const adminTransactions: AdminTransaction[] = [
  { id: 'txn-a001', type: 'escrow_to_creator', from: 'Escrow', to: 'Sofia Martinez', amount: 1200, paymentStatus: 'released', date: '2026-04-13', campaignId: 'camp-001', campaignTitle: 'Summer Glow Skincare' },
  { id: 'txn-a002', type: 'brand_to_escrow', from: 'Luminary Skincare', to: 'Escrow', amount: 6000, paymentStatus: 'held', date: '2026-04-11', campaignId: 'camp-001', campaignTitle: 'Summer Glow Skincare' },
  { id: 'txn-a003', type: 'withdrawal', from: 'Sofia Martinez', to: 'PayPal', amount: 500, paymentStatus: 'completed', date: '2026-04-10' },
  { id: 'txn-a004', type: 'escrow_to_creator', from: 'Escrow', to: 'Jordan Osei', amount: 3500, paymentStatus: 'released', date: '2026-04-09', campaignId: 'camp-002', campaignTitle: 'FitPro 30-Day Challenge' },
  { id: 'txn-a005', type: 'brand_to_escrow', from: 'FitPro Health', to: 'Escrow', amount: 10500, paymentStatus: 'held', date: '2026-04-08', campaignId: 'camp-002', campaignTitle: 'FitPro 30-Day Challenge' },
  { id: 'txn-a006', type: 'withdrawal', from: 'Priya Nair', to: 'Bank Transfer', amount: 2000, paymentStatus: 'pending', date: '2026-04-07' },
  { id: 'txn-a007', type: 'refund', from: 'Escrow', to: 'SpamBrand LLC', amount: 500, paymentStatus: 'completed', date: '2026-03-06', campaignId: 'camp-003', campaignTitle: 'Suspicious Crypto Giveaway' },
  { id: 'txn-a008', type: 'escrow_to_creator', from: 'Escrow', to: 'Aisha Okonkwo', amount: 950, paymentStatus: 'released', date: '2026-04-06', campaignId: 'camp-004', campaignTitle: 'TechDrop Earbuds Review' },
  { id: 'txn-a009', type: 'brand_to_escrow', from: 'TechDrop', to: 'Escrow', amount: 6400, paymentStatus: 'disputed', date: '2026-04-04', campaignId: 'camp-004', campaignTitle: 'TechDrop Earbuds Review' },
  { id: 'txn-a010', type: 'withdrawal', from: 'Mei-Lin Chen', to: 'Wise', amount: 900, paymentStatus: 'failed', date: '2026-04-05' },
  { id: 'txn-a011', type: 'brand_to_escrow', from: 'EcoBottle', to: 'Escrow', amount: 3200, paymentStatus: 'held', date: '2026-04-05', campaignId: 'camp-008', campaignTitle: 'EcoBottle Zero-Waste Push' },
  { id: 'txn-a012', type: 'escrow_to_creator', from: 'Escrow', to: 'Priya Nair', amount: 2800, paymentStatus: 'held', date: '2026-04-03', campaignId: 'camp-002', campaignTitle: 'FitPro 30-Day Challenge' },
];

const adminDisputes: AdminDispute[] = [
  { id: 'dsp-001', campaignTitle: 'TechDrop Earbuds Review', campaignId: 'camp-004', creator: 'Aisha Okonkwo', brand: 'TechDrop', reason: 'Brand claims deliverable did not meet brief requirements. Creator says brand changed requirements after submission.', amount: 6400, status: 'open', openedAt: '2026-04-10', priority: 'high' },
  { id: 'dsp-002', campaignTitle: 'EcoBottle Zero-Waste Push', campaignId: 'camp-008', creator: 'Mei-Lin Chen', brand: 'EcoBottle', reason: 'Creator submitted content 5 days late. Brand requesting partial refund of 40%.', amount: 3200, status: 'open', openedAt: '2026-04-08', priority: 'medium' },
  { id: 'dsp-003', campaignTitle: 'GameVault Pro Controller', campaignId: 'camp-007', creator: 'Marcus Webb', brand: 'GameVault', reason: 'Creator claims payment was not released after approved deliverable. Brand disputes approval.', amount: 1800, status: 'escalated', openedAt: '2026-04-06', priority: 'high' },
  { id: 'dsp-004', campaignTitle: 'NomadPay Travel Creator Push', campaignId: 'camp-005', creator: 'Jordan Osei', brand: 'NomadPay', reason: 'Creator withdrew from campaign mid-way. Brand requesting full refund of advance payment.', amount: 2000, status: 'resolved', openedAt: '2026-03-28', priority: 'low' },
  { id: 'dsp-005', campaignTitle: 'Summer Glow Skincare Launch', campaignId: 'camp-001', creator: 'Sofia Martinez', brand: 'Luminary Skincare', reason: 'Brand delayed payment release by 14 days beyond agreed timeline.', amount: 1200, status: 'refunded', openedAt: '2026-03-20', priority: 'medium' },
];

const aiMatches: AIMatch[] = [
  { id: 'match-001', campaignTitle: 'Summer Glow Skincare Launch', campaignId: 'camp-001', creatorName: 'Sofia Martinez', creatorNiche: 'Beauty & Skincare', matchScore: 94, reasons: ['High engagement rate (6.2%)', 'Skincare niche alignment', 'Female 18-34 audience (82%)', 'Past brand collab: GlowLab'], status: 'active', matchedAt: '2026-04-01', engagement: 6.2, followers: 48200 },
  { id: 'match-002', campaignTitle: 'Summer Glow Skincare Launch', campaignId: 'camp-001', creatorName: 'Aisha Okonkwo', creatorNiche: 'Beauty & Lifestyle', matchScore: 88, reasons: ['Beauty content creator', 'Authentic skin-tone diversity', 'Strong story engagement (8.1%)', 'Location: Lagos — brand target market'], status: 'active', matchedAt: '2026-04-01', engagement: 8.1, followers: 31500 },
  { id: 'match-003', campaignTitle: 'FitPro App — 30-Day Challenge', campaignId: 'camp-002', creatorName: 'Jordan Osei', creatorNiche: 'Fitness & Health', matchScore: 97, reasons: ['Fitness niche — exact match', 'Long-form YouTube content (avg 18 min)', 'High completion rate (72%)', 'Previous fitness app collab'], status: 'active', matchedAt: '2026-03-20', engagement: 5.8, followers: 74200 },
  { id: 'match-004', campaignTitle: 'FitPro App — 30-Day Challenge', campaignId: 'camp-002', creatorName: 'Priya Nair', creatorNiche: 'Wellness & Yoga', matchScore: 79, reasons: ['Wellness audience overlap', 'Female fitness demographic', 'Strong India + US reach'], status: 'active', matchedAt: '2026-03-20', engagement: 7.3, followers: 92100 },
  { id: 'match-005', campaignTitle: 'GameVault Pro Controller', campaignId: 'camp-007', creatorName: 'Marcus Webb', creatorNiche: 'Gaming & Tech', matchScore: 85, reasons: ['Gaming content creator', 'Tech review experience', 'Male 18-28 audience (91%)', 'High TikTok engagement (9.4%)'], status: 'active', matchedAt: '2026-03-28', engagement: 9.4, followers: 18500 },
  { id: 'match-006', campaignTitle: 'GameVault Pro Controller', campaignId: 'camp-007', creatorName: 'Mei-Lin Chen', creatorNiche: 'Lifestyle & Tech', matchScore: 61, reasons: ['Partial tech audience overlap', 'Lower gaming content ratio (12%)'], status: 'removed', matchedAt: '2026-03-28', engagement: 4.1, followers: 22800 },
];

const adminWithdrawals: AdminWithdrawal[] = [
  { id: 'wd-001', creator: 'Priya Nair', email: 'priya@creators.io', amount: 2000, method: 'Bank Transfer (ACH)', account: '****8821', status: 'pending', requestedAt: '2026-04-07', fee: 15 },
  { id: 'wd-002', creator: 'Jordan Osei', email: 'jordan@fitcreators.io', amount: 1500, method: 'PayPal', account: 'jordan@fitcreators.io', status: 'pending', requestedAt: '2026-04-08', fee: 15 },
  { id: 'wd-003', creator: 'Aisha Okonkwo', email: 'aisha@beautycreators.co', amount: 800, method: 'Stripe Instant', account: '****4412', status: 'pending', requestedAt: '2026-04-09', fee: 12 },
  { id: 'wd-004', creator: 'Marcus Webb', email: 'marcus@ugcpro.io', amount: 350, method: 'PayPal', account: 'marcus@ugcpro.io', status: 'pending', requestedAt: '2026-04-10', fee: 5.25 },
  { id: 'wd-005', creator: 'Yuki Tanaka', email: 'yuki@beautyco.jp', amount: 1300, method: 'Wise', account: 'yuki@beautyco.jp', status: 'pending', requestedAt: '2026-04-11', fee: 15 },
  { id: 'wd-006', creator: 'Daniela Rossi', email: 'd.rossi@creators.eu', amount: 2200, method: 'Bank Transfer', account: '****9901', status: 'approved', requestedAt: '2026-04-06', fee: 15 },
  { id: 'wd-007', creator: 'Mei-Lin Chen', email: 'meichen@skinfluencer.co', amount: 900, method: 'Wise', account: 'meichen@skinfluencer.co', status: 'rejected', requestedAt: '2026-04-05', fee: 13.5 },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────

const gmvData7D = [
  { day: 'Mon', gmv: 18200 }, { day: 'Tue', gmv: 22400 }, { day: 'Wed', gmv: 19800 },
  { day: 'Thu', gmv: 28600 }, { day: 'Fri', gmv: 31200 }, { day: 'Sat', gmv: 24900 }, { day: 'Sun', gmv: 27500 },
];
const gmvData30D = [
  { day: 'W1', gmv: 68200 }, { day: 'W2', gmv: 74600 }, { day: 'W3', gmv: 81800 }, { day: 'W4', gmv: 78900 },
];
const gmvData90D = [
  { day: 'Jan', gmv: 198000 }, { day: 'Feb', gmv: 231200 }, { day: 'Mar', gmv: 218900 },
];

const sparklineData = [12, 18, 14, 22, 19, 28, 25];

const revenueByCategory = [
  { category: 'Beauty', revenue: 38400, campaigns: 14 },
  { category: 'Fitness', revenue: 29800, campaigns: 9 },
  { category: 'Tech', revenue: 24600, campaigns: 8 },
  { category: 'Fashion', revenue: 21200, campaigns: 11 },
  { category: 'Travel', revenue: 18900, campaigns: 6 },
  { category: 'Gaming', revenue: 15300, campaigns: 5 },
];

const revenueByPlatform = [
  { platform: 'Instagram', revenue: 58400, share: 39 },
  { platform: 'YouTube', revenue: 42800, share: 29 },
  { platform: 'TikTok', revenue: 31200, share: 21 },
  { platform: 'Twitter', revenue: 9800, share: 7 },
  { platform: 'LinkedIn', revenue: 5800, share: 4 },
];

const conversionFunnel = [
  { stage: 'Campaigns Posted', value: 54, color: '#7C3AED' },
  { stage: 'Applications Received', value: 487, color: '#6D28D9' },
  { stage: 'Creators Approved', value: 142, color: '#5B21B6' },
  { stage: 'Deliverables Submitted', value: 118, color: '#4C1D95' },
  { stage: 'Campaigns Completed', value: 94, color: '#3B0764' },
];

const topCreators = [
  { name: 'Jordan Osei', niche: 'Fitness', earnings: 4800, collabs: 8, rating: 4.9 },
  { name: 'Sofia Martinez', niche: 'Beauty', earnings: 8650, collabs: 14, rating: 4.8 },
  { name: 'Priya Nair', niche: 'Wellness', earnings: 5200, collabs: 9, rating: 4.7 },
  { name: 'Aisha Okonkwo', niche: 'Beauty', earnings: 3100, collabs: 5, rating: 4.6 },
];

const topBrands = [
  { name: 'Luminary Skincare', spend: 68000, campaigns: 14, avgROI: 3.2 },
  { name: 'NovaSpark Co.', spend: 42000, campaigns: 8, avgROI: 2.8 },
  { name: 'FitPro Health', spend: 31500, campaigns: 6, avgROI: 3.5 },
  { name: 'GameVault', spend: 18200, campaigns: 4, avgROI: 2.1 },
];

const monthlyRevenue = [
  { month: 'Nov', gmv: 18200, fees: 910 }, { month: 'Dec', gmv: 24600, fees: 1230 },
  { month: 'Jan', gmv: 19800, fees: 990 }, { month: 'Feb', gmv: 31200, fees: 1560 },
  { month: 'Mar', gmv: 28900, fees: 1445 }, { month: 'Apr', gmv: 25500, fees: 1275 },
];

const liveActivityFeed = [
  { id: 'act-001', type: 'user', color: 'bg-emerald-500', icon: '🟢', text: 'New creator signed up — Marcus Webb', time: '2 min ago', href: '/admin-panel/users' },
  { id: 'act-002', type: 'campaign', color: 'bg-blue-500', icon: '🔵', text: 'Campaign created by StyleForward', time: '8 min ago', href: '/admin-panel/campaigns' },
  { id: 'act-003', type: 'payment', color: 'bg-amber-500', icon: '🟡', text: '₹10,500 added to escrow by FitPro Health', time: '15 min ago', href: '/admin-panel/escrow' },
  { id: 'act-004', type: 'flag', color: 'bg-red-500', icon: '🔴', text: 'Campaign flagged — policy violation (SpamBrand)', time: '22 min ago', href: '/admin-panel/flagged' },
  { id: 'act-005', type: 'payment', color: 'bg-violet-500', icon: '🟣', text: 'Payout released to Jordan Osei —₹3,500', time: '34 min ago', href: '/admin-panel/payouts' },
  { id: 'act-006', type: 'user', color: 'bg-emerald-500', icon: '🟢', text: 'KYC verified for Aisha Okonkwo', time: '1 hr ago', href: '/admin-panel/users' },
  { id: 'act-007', type: 'campaign', color: 'bg-blue-500', icon: '🔵', text: 'Campaign approved — NomadPay Travel Push', time: '2 hr ago', href: '/admin-panel/campaigns' },
  { id: 'act-008', type: 'payment', color: 'bg-amber-500', icon: '🟡', text: 'Withdrawal request — Priya Nair ₹2,000', time: '3 hr ago', href: '/admin-panel/payouts' },
];

const PLATFORM_COLORS = ['#EC4899', '#EF4444', '#1e293b', '#0EA5E9', '#3B82F6'];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#7C3AED' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function UserStatusBadge({ status }: { status: AdminUser['status'] }) {
  const map: Record<AdminUser['status'], { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    suspended: { label: 'Suspended', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    pending_kyc: { label: 'Pending KYC', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    banned: { label: 'Banned', cls: 'bg-red-50 text-red-700 border border-red-200' },
    verified: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  };
  const { label, cls } = map[status] ?? map.active;
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function KYCBadge({ status }: { status: AdminUser['kycStatus'] }) {
  const map: Record<AdminUser['kycStatus'], { label: string; cls: string }> = {
    verified: { label: 'KYC ✓', cls: 'bg-emerald-50 text-emerald-700' },
    pending: { label: 'KYC Pending', cls: 'bg-amber-50 text-amber-700' },
    not_submitted: { label: 'No KYC', cls: 'bg-slate-100 text-slate-500' },
    rejected: { label: 'KYC Rejected', cls: 'bg-red-50 text-red-700' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function PaymentStatusBadge({ status }: { status: AdminTransaction['paymentStatus'] }) {
  const map: Record<AdminTransaction['paymentStatus'], { label: string; cls: string }> = {
    held: { label: 'Held', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    released: { label: 'Released', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    disputed: { label: 'Disputed', cls: 'bg-red-50 text-red-700 border border-red-200' },
    completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600' },
    pending: { label: 'Pending', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    failed: { label: 'Failed', cls: 'bg-red-50 text-red-600' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function DisputeStatusBadge({ status }: { status: AdminDispute['status'] }) {
  const map: Record<AdminDispute['status'], { label: string; cls: string }> = {
    open: { label: 'Open', cls: 'bg-red-50 text-red-700 border border-red-200' },
    resolved: { label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    escalated: { label: 'Escalated', cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
    refunded: { label: 'Refunded', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function CampaignModerationBadge({ status }: { status: AdminCampaign['status'] }) {
  const map: Record<AdminCampaign['status'], { label: string; cls: string }> = {
    pending_approval: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600' },
    flagged: { label: 'Flagged', cls: 'bg-red-50 text-red-700 border border-red-200' },
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-500' },
    frozen: { label: 'Frozen', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ActivityLogModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Activity Log</h3>
            <p className="text-xs text-slate-500">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><XCircle size={16} /></button>
        </div>
        <div className="space-y-3">
          {user.activityLog.map((log, i) => (
            <div key={`log-${i}`} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-700">{log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">Close</button>
      </div>
    </div>
  );
}

function CampaignDetailModal({ campaign, onClose }: { campaign: AdminCampaign; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">{campaign.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{campaign.brand} · {campaign.platform}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><XCircle size={16} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Budget</p>
              <p className="text-lg font-bold text-slate-800">₹{campaign.budget.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <CampaignModerationBadge status={campaign.status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Content Brief</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 leading-relaxed">{campaign.contentBrief}</p>
          </div>
          {campaign.creatorsInvolved.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Creators Involved</p>
              <div className="flex flex-wrap gap-2">
                {campaign.creatorsInvolved.map(c => (
                  <span key={c} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {campaign.flagReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Flag Reason</p>
              <p className="text-sm text-red-700">{campaign.flagReason}</p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">{campaign.applicants} applicants · {campaign.reportCount} reports</span>
          </div>
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">Close</button>
      </div>
    </div>
  );
}

// ─── GMV Trend Chart with Filters ─────────────────────────────────────────────

function GMVTrendChart() {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const dataMap = { '7D': gmvData7D, '30D': gmvData30D, '90D': gmvData90D };
  const data = dataMap[range];
  const insights: Record<string, string> = {
    '7D': 'GMV peaked Thursday — 3 high-budget campaigns launched mid-week',
    '30D': 'Week 3 saw highest GMV — StyleForward Fall Collection drove ₹18K',
    '90D': 'February was strongest month — FitPro 30-Day Challenge contributed ₹10.5K',
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5">
        <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-violet-700">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-slate-400 mt-0.5">+{Math.round(Math.random() * 15 + 5)}% vs prev period</p>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">GMV Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5 italic">"{insights[range]}"</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['7D', '30D', '90D'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${range === r ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{r}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGMV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="gmv" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gradGMV2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Live Activity Feed ───────────────────────────────────────────────────────

function LiveActivityFeed() {
  const [filter, setFilter] = useState<'all' | 'user' | 'payment' | 'campaign' | 'flag'>('all');
  const filtered = filter === 'all' ? liveActivityFeed : liveActivityFeed.filter(a => a.type === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800">Live Activity</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'user', 'payment', 'campaign', 'flag'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors capitalize ${filter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {f === 'all' ? 'All' : f === 'user' ? 'Users' : f === 'payment' ? 'Payments' : f === 'campaign' ? 'Campaigns' : 'Flags'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filtered.map(activity => (
          <a key={activity.id} href={activity.href} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-snug group-hover:text-violet-700 transition-colors">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">No activity in this category</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminContent() {
  // ── Auth guard — only ADMIN role can view this ───────────────────────────────
  const { user: authUser, loading: authLoading, logout } = useAuth('admin');

  // ── Real API state ────────────────────────────────────────────────────────────
  const [apiStats, setApiStats] = useState<{ totalUsers: number; totalCampaigns: number; gmv: number } | null>(null);
  const [apiUsers, setApiUsers] = useState<Array<{
    id: string; name: string; email: string; status: string; is_banned: boolean;
    role?: { name: string }; created_at: string;
  }> | null>(null);
  const [apiCampaigns, setApiCampaigns] = useState<Array<{
    id: string; title: string; status: string; budget: number; platform: string;
    brand?: { company_name: string };
  }> | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  const loadApiData = useCallback(async () => {
    setApiLoading(true);
    try {
      const [stats, users, campaigns] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getUsers(),
        adminApi.getCampaigns(),
      ]);
      setApiStats(stats);
      setApiUsers(users);
      setApiCampaigns(campaigns);
    } catch (err: any) {
      // Silently fall back to mock data — avoids breaking the UI
      console.warn('Admin API error, using mock data:', err.message);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadApiData();
    }
  }, [authLoading, loadApiData]);

  // ── Tab / filter state ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [withdrawalStatuses, setWithdrawalStatuses] = useState<Record<string, AdminWithdrawal['status']>>(
    Object.fromEntries(adminWithdrawals.map(w => [w.id, w.status]))
  );
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, AdminCampaign['status']>>(
    Object.fromEntries(adminCampaigns.map(c => [c.id, c.status]))
  );
  const [transactionStatuses, setTransactionStatuses] = useState<Record<string, AdminTransaction['paymentStatus']>>(
    Object.fromEntries(adminTransactions.map(t => [t.id, t.paymentStatus]))
  );
  const [disputeStatuses, setDisputeStatuses] = useState<Record<string, AdminDispute['status']>>(
    Object.fromEntries(adminDisputes.map(d => [d.id, d.status]))
  );
  const [matchStatuses, setMatchStatuses] = useState<Record<string, AIMatch['status']>>(
    Object.fromEntries(aiMatches.map(m => [m.id, m.status]))
  );
  const [activityLogUser, setActivityLogUser] = useState<AdminUser | null>(null);
  const [campaignDetailItem, setCampaignDetailItem] = useState<AdminCampaign | null>(null);
  const [txnFilter, setTxnFilter] = useState('all');
  const [disputeFilter, setDisputeFilter] = useState('all');

  // Use real API data if available, otherwise fall back to mock data
  const gmv = apiStats?.gmv ?? 148200;
  const totalUsersCount = apiStats?.totalUsers ?? adminUsers.length;
  const activeUsers = apiUsers
    ? apiUsers.filter(u => !u.is_banned).length
    : adminUsers.filter(u => u.status === 'active' || u.status === 'verified').length;
  const pendingWithdrawals = adminWithdrawals.filter(w => withdrawalStatuses[w.id] === 'pending').length;
  const flaggedCampaigns = adminCampaigns.filter(c => campaignStatuses[c.id] === 'flagged').length;
  const pendingApprovalCampaigns = adminCampaigns.filter(c => campaignStatuses[c.id] === 'pending_approval').length;
  const openDisputes = adminDisputes.filter(d => disputeStatuses[d.id] === 'open' || disputeStatuses[d.id] === 'escalated').length;
  const escrowVolume = 42800;
  const platformFee = 3640;
  const pendingVerifications = adminUsers.filter(u => u.status === 'pending_kyc').length;

  const handleUserAction = async (userId: string, action: 'verify' | 'ban' | 'suspend' | 'unsuspend') => {
    try {
      if (action === 'ban') {
        await adminApi.banUser(userId);
        toast.success('User banned successfully');
        loadApiData(); // Refresh the user list
      } else {
        toast.success(`User ${action === 'verify' ? 'verified' : action === 'suspend' ? 'suspended' : 'unsuspended'} successfully`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleWithdrawal = (wdId: string, decision: 'approved' | 'rejected') => {
    setWithdrawalStatuses(prev => ({ ...prev, [wdId]: decision }));
    const wd = adminWithdrawals.find(w => w.id === wdId);
    toast.success(`Withdrawal ${decision} for ${wd?.creator}`);
  };

  const handleCampaignAction = async (campId: string, action: 'approve' | 'reject' | 'freeze' | 'request_changes') => {
    const newStatus: AdminCampaign['status'] = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : action === 'freeze' ? 'frozen' : 'pending_approval';
    try {
      if (action === 'approve') {
        await adminApi.approveCampaign(campId);
      } else if (action === 'reject') {
        await adminApi.rejectCampaign(campId);
      }
      setCampaignStatuses(prev => ({ ...prev, [campId]: newStatus }));
      const labels: Record<string, string> = { approve: 'approved', reject: 'rejected', freeze: 'frozen', request_changes: 'sent back for changes' };
      toast.success(`Campaign ${labels[action]}`);
      loadApiData(); // Refresh campaigns
    } catch (err: any) {
      toast.error(err.message || 'Campaign action failed');
    }
  };

  const handleTransactionAction = (txnId: string, action: 'release' | 'hold' | 'refund') => {
    const newStatus: AdminTransaction['paymentStatus'] = action === 'release' ? 'released' : action === 'hold' ? 'held' : 'completed';
    setTransactionStatuses(prev => ({ ...prev, [txnId]: newStatus }));
    toast.success(`Payment ${action === 'release' ? 'released to creator' : action === 'hold' ? 'placed on hold' : 'refunded to brand'}`);
  };

  const handleDisputeAction = (dspId: string, action: 'resolve' | 'refund' | 'escalate' | 'partial_payout') => {
    const newStatus: AdminDispute['status'] = action === 'resolve' ? 'resolved' : action === 'refund' || action === 'partial_payout' ? 'refunded' : 'escalated';
    setDisputeStatuses(prev => ({ ...prev, [dspId]: newStatus }));
    const labels: Record<string, string> = { resolve: 'resolved', refund: 'refunded', escalate: 'escalated to senior team', partial_payout: 'partial payout issued' };
    toast.success(`Dispute ${labels[action]}`);
  };

  const handleMatchAction = (matchId: string, action: 'force_match' | 'remove') => {
    const newStatus: AIMatch['status'] = action === 'force_match' ? 'force_matched' : 'removed';
    setMatchStatuses(prev => ({ ...prev, [matchId]: newStatus }));
    toast.success(`Match ${action === 'force_match' ? 'force-applied' : 'removed'} successfully`);
  };

  const filteredUsers = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const filteredTransactions = adminTransactions.filter(t => txnFilter === 'all' || t.paymentStatus === txnFilter || t.type === txnFilter);
  const filteredDisputes = adminDisputes.filter(d => disputeFilter === 'all' || disputeStatuses[d.id] === disputeFilter);

  const tabs: { key: AdminTab; label: string; count?: number; alert?: boolean }[] = [
    { key: 'users', label: 'Users', count: adminUsers.length },
    { key: 'campaigns', label: 'Campaigns', count: pendingApprovalCampaigns + flaggedCampaigns, alert: (pendingApprovalCampaigns + flaggedCampaigns) > 0 },
    { key: 'transactions', label: 'Transactions', count: adminTransactions.length },
    { key: 'disputes', label: 'Disputes', count: openDisputes, alert: openDisputes > 0 },
    { key: 'ai-matching', label: 'AI Matching', count: aiMatches.filter(m => matchStatuses[m.id] === 'active').length },
    { key: 'analytics', label: 'Analytics' },
    { key: 'withdrawals', label: 'Withdrawals', count: pendingWithdrawals, alert: pendingWithdrawals > 0 },
  ];

  // ── Guard: show nothing while auth is loading ──────────────────────────────
  if (authLoading || apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      {activityLogUser && <ActivityLogModal user={activityLogUser} onClose={() => setActivityLogUser(null)} />}
      {campaignDetailItem && <CampaignDetailModal campaign={campaignDetailItem} onClose={() => setCampaignDetailItem(null)} />}

      {/* ── ROW 1: CRITICAL METRICS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {/* GMV Card */}
        <a href="/admin-panel/transactions" className="group bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide">Platform GMV</p>
            <TrendingUp size={16} className="text-violet-300" />
          </div>
          <p className="text-3xl font-extrabold tabular-nums">₹{gmv.toLocaleString()}</p>
          <p className="text-violet-300 text-xs mt-1 flex items-center gap-1"><ArrowUpRight size={12} /> +18.4% this month</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-violet-300 text-xs">Highest: ₹32K (Feb)</p>
            <Sparkline data={sparklineData} color="rgba(255,255,255,0.7)" />
          </div>
        </a>

        {/* Active Users Card */}
        <a href="/admin-panel/users" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total Users</p>
            <Users size={15} className="text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 tabular-nums">{totalUsersCount}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 text-xs">{activeUsers} active</p>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-emerald-600 text-xs font-medium">Live from DB</p>
            <Sparkline data={[3, 5, 4, 6, 5, 7, 6]} color="#3B82F6" />
          </div>
        </a>

        {/* Platform Fees Card */}
        <a href="/admin-panel/transactions" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Platform Fees</p>
            <DollarSign size={15} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 tabular-nums">₹{platformFee.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">This month</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-emerald-600 text-xs font-medium flex items-center gap-1"><ArrowUpRight size={11} /> +12.1%</p>
            <Sparkline data={[8, 12, 10, 15, 13, 18, 16]} color="#10B981" />
          </div>
        </a>

        {/* Escrow Volume Card */}
        <a href="/admin-panel/escrow" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Escrow Volume</p>
            <Lock size={15} className="text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800 tabular-nums">₹{escrowVolume.toLocaleString()}</p>
          <p className="text-blue-600 text-xs mt-1 font-medium">Currently locked</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-slate-400 text-xs">8 active campaigns</p>
            <Sparkline data={[20, 28, 24, 35, 30, 42, 38]} color="#64748B" />
          </div>
        </a>
      </div>

      {/* ── ROW 2: ACTION REQUIRED ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Flagged Campaigns — URGENT */}
        <a href="/admin-panel/flagged" className="group relative bg-white rounded-2xl border-2 border-red-300 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-red-50/60 rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 animate-pulse" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-700 text-xs font-bold uppercase tracking-wide">Flagged Campaigns</p>
              </div>
              <Flag size={15} className="text-red-500" />
            </div>
            <p className="text-3xl font-extrabold text-red-700 tabular-nums">{flaggedCampaigns}</p>
            <p className="text-red-600 text-xs mt-1">Requires immediate review</p>
            <button className="mt-3 w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors">
              Review Now →
            </button>
          </div>
        </a>

        {/* Pending Payouts */}
        <a href="/admin-panel/payouts" className="group bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-amber-700 text-xs font-bold uppercase tracking-wide">Pending Payouts</p>
            <Wallet size={15} className="text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-700 tabular-nums">{pendingWithdrawals}</p>
          <p className="text-amber-600 text-xs mt-1">₹1.2L pending approval</p>
          <button className="mt-3 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
            Approve →
          </button>
        </a>

        {/* Pending Verifications */}
        <a href="/admin-panel/users" className="group bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-xs font-bold uppercase tracking-wide">Pending Verifications</p>
            <Shield size={15} className="text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-blue-700 tabular-nums">{pendingVerifications}</p>
          <p className="text-blue-600 text-xs mt-1">KYC awaiting review</p>
          <button className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
            Verify →
          </button>
        </a>
      </div>

      {/* ── ROW 3: CHARTS + LIVE FEED ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* GMV Trend Chart — 70% */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <GMVTrendChart />
        </div>

        {/* Campaigns by Platform — 30% */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Campaigns by Platform</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across social platforms</p>
          <AdminPlatformChart />
        </div>
      </div>

      {/* ── LIVE ACTIVITY FEED + MANAGEMENT TABS ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Management Tabs — 75% */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex border-b border-slate-100 px-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={`admin-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    tab.alert ? 'bg-red-100 text-red-700' :
                    activeTab === tab.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── USERS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white" />
                </div>
                <div className="relative">
                  <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                    <option value="all">All Roles</option>
                    <option value="creator">Creators</option>
                    <option value="brand">Brands</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none text-slate-700">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_kyc">Pending KYC</option>
                    <option value="banned">Banned</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors ml-auto">
                  <Download size={13} /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['User', 'Role', 'Status', 'KYC', 'Earnings / Spend', 'Activity', 'Last Active', 'Actions'].map(col => (
                        <th key={`usr-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-violet-700 text-xs font-bold">{user.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'creator' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role === 'creator' ? 'Creator' : 'Brand'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><UserStatusBadge status={user.status} /></td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><KYCBadge status={user.kycStatus} /></td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {user.role === 'creator' ? (
                            <p className="text-sm font-semibold text-emerald-700 tabular-nums">₹{(user.totalEarnings ?? 0).toLocaleString()}</p>
                          ) : (
                            <p className="text-sm font-semibold text-blue-700 tabular-nums">₹{(user.totalSpend ?? 0).toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-slate-600 tabular-nums">{user.role === 'creator' ? `${user.collabs} collabs` : `${user.campaigns} campaigns`}</p>
                          {user.role === 'creator' && user.followers && (
                            <p className="text-xs text-slate-400">{(user.followers / 1000).toFixed(1)}K followers</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{user.lastActive}</p></td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleUserAction(user.id, 'verify')} className="p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 transition-colors" title="Verify manually"><UserCheck size={14} /></button>
                            <button onClick={() => handleUserAction(user.id, user.status === 'suspended' ? 'unsuspend' : 'suspend')} className="p-1.5 rounded-md hover:bg-amber-50 hover:text-amber-700 text-slate-400 transition-colors" title={user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}><Slash size={14} /></button>
                            <button onClick={() => handleUserAction(user.id, 'ban')} className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-700 text-slate-400 transition-colors" title="Ban account"><Ban size={14} /></button>
                            <button onClick={() => setActivityLogUser(user)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title="View activity log"><FileText size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CAMPAIGNS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending_approval', 'flagged', 'frozen', 'active', 'completed'].map(s => (
                    <button key={s} onClick={() => {}} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${s === 'all' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      {s === 'all' ? 'All' : s === 'pending_approval' ? 'Pending Approval' : s.charAt(0).toUpperCase() + s.slice(1)}
                      {s === 'pending_approval' && pendingApprovalCampaigns > 0 && <span className="ml-1.5 bg-amber-100 text-amber-700 px-1 rounded-full">{pendingApprovalCampaigns}</span>}
                      {s === 'flagged' && flaggedCampaigns > 0 && <span className="ml-1.5 bg-red-100 text-red-700 px-1 rounded-full">{flaggedCampaigns}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Campaign', 'Brand', 'Platform', 'Budget', 'Status', 'Applicants', 'Reports', 'Actions'].map(col => (
                        <th key={`camp-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {adminCampaigns.map(campaign => {
                      const currentStatus = campaignStatuses[campaign.id];
                      return (
                        <tr key={campaign.id} className={`hover:bg-slate-50/60 transition-colors group ${currentStatus === 'flagged' ? 'bg-red-50/20' : currentStatus === 'pending_approval' ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[200px]">{campaign.title}</p>
                            {campaign.flagReason && currentStatus === 'flagged' && (
                              <p className="text-xs text-red-600 mt-0.5 line-clamp-1 max-w-[200px]">{campaign.flagReason}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{campaign.brand}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><PlatformBadge platform={campaign.platform} /></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-semibold text-slate-800 tabular-nums">₹{campaign.budget.toLocaleString()}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><CampaignModerationBadge status={currentStatus} /></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-700 tabular-nums">{campaign.applicants}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {campaign.reportCount > 0 ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-700"><AlertTriangle size={12} /> {campaign.reportCount}</span>
                            ) : <span className="text-xs text-slate-300">—</span>}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setCampaignDetailItem(campaign)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title="View details"><Eye size={14} /></button>
                              {(currentStatus === 'pending_approval' || currentStatus === 'flagged') && (
                                <button onClick={() => handleCampaignAction(campaign.id, 'approve')} className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors">
                                  <CheckCircle size={12} /> Approve
                                </button>
                              )}
                              {(currentStatus === 'pending_approval' || currentStatus === 'flagged' || currentStatus === 'active') && (
                                <button onClick={() => handleCampaignAction(campaign.id, 'reject')} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors">
                                  <XCircle size={12} /> Reject
                                </button>
                              )}
                              {currentStatus === 'pending_approval' && (
                                <button onClick={() => handleCampaignAction(campaign.id, 'request_changes')} className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors">
                                  <RefreshCw size={12} /> Changes
                                </button>
                              )}
                              {currentStatus === 'active' && (
                                <button onClick={() => handleCampaignAction(campaign.id, 'freeze')} className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors">
                                  <Lock size={12} /> Freeze
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ──────────────────────────────────────────── */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: 'all', label: 'All' }, { val: 'held', label: 'Held' }, { val: 'disputed', label: 'Disputed' },
                    { val: 'brand_to_escrow', label: 'Brand → Escrow' }, { val: 'escrow_to_creator', label: 'Escrow → Creator' },
                  ].map(f => (
                    <button key={f.val} onClick={() => setTxnFilter(f.val)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${txnFilter === f.val ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg font-medium">
                    {adminTransactions.filter(t => transactionStatuses[t.id] === 'disputed').length} disputed
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Txn ID', 'Type', 'From → To', 'Amount', 'Status', 'Campaign', 'Date', 'Actions'].map(col => (
                        <th key={`txn-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map(txn => {
                      const currentStatus = transactionStatuses[txn.id];
                      return (
                        <tr key={txn.id} className={`hover:bg-slate-50/60 transition-colors group ${currentStatus === 'disputed' ? 'bg-red-50/20' : currentStatus === 'held' ? 'bg-amber-50/10' : ''}`}>
                          <td className="px-5 py-3.5 whitespace-nowrap"><span className="text-xs font-mono text-slate-500">{txn.id}</span></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${txn.type === 'escrow_to_creator' ? 'bg-emerald-50 text-emerald-700' : txn.type === 'brand_to_escrow' ? 'bg-blue-50 text-blue-700' : txn.type === 'withdrawal' ? 'bg-slate-100 text-slate-600' : txn.type === 'refund' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}>
                              {txn.type === 'brand_to_escrow' ? 'Brand → Escrow' : txn.type === 'escrow_to_creator' ? 'Escrow → Creator' : txn.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-sm text-slate-700">{txn.from}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1"><ArrowRight size={10} /> {txn.to}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800 tabular-nums">₹{txn.amount.toLocaleString()}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><PaymentStatusBadge status={currentStatus} /></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {txn.campaignTitle ? <p className="text-xs text-violet-600 max-w-[120px] truncate">{txn.campaignTitle}</p> : <span className="text-xs text-slate-300">—</span>}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-500">{txn.date}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {currentStatus === 'held' && <button onClick={() => handleTransactionAction(txn.id, 'release')} className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"><Unlock size={12} /> Release</button>}
                              {(currentStatus === 'released' || currentStatus === 'completed') && <button onClick={() => handleTransactionAction(txn.id, 'hold')} className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors"><Lock size={12} /> Hold</button>}
                              {(currentStatus === 'held' || currentStatus === 'disputed') && <button onClick={() => handleTransactionAction(txn.id, 'refund')} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors"><RotateCcw size={12} /> Refund</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DISPUTES TAB ──────────────────────────────────────────────── */}
          {activeTab === 'disputes' && (
            <div>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
                <div className="flex gap-2">
                  {['all', 'open', 'escalated', 'resolved', 'refunded'].map(s => (
                    <button key={s} onClick={() => setDisputeFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${disputeFilter === s ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {s === 'open' && openDisputes > 0 && <span className="ml-1.5 bg-red-100 text-red-700 px-1 rounded-full">{openDisputes}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredDisputes.map(dispute => {
                  const currentStatus = disputeStatuses[dispute.id];
                  const isActionable = currentStatus === 'open' || currentStatus === 'escalated';
                  return (
                    <div key={dispute.id} className={`px-5 py-4 hover:bg-slate-50/60 transition-colors ${currentStatus === 'escalated' ? 'bg-orange-50/20' : currentStatus === 'open' ? 'bg-red-50/10' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dispute.priority === 'high' ? 'bg-red-100 text-red-700' : dispute.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {dispute.priority.toUpperCase()} PRIORITY
                            </span>
                            <DisputeStatusBadge status={currentStatus} />
                            <span className="text-xs font-mono text-slate-400">{dispute.id}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800 mb-1">{dispute.campaignTitle}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                            <span className="font-medium text-violet-700">{dispute.creator}</span>
                            <span className="text-slate-300">vs</span>
                            <span className="font-medium text-blue-700">{dispute.brand}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-semibold text-slate-700">₹{dispute.amount.toLocaleString()} at stake</span>
                            <span className="text-slate-300">·</span>
                            <span>Opened {dispute.openedAt}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{dispute.reason}</p>
                        </div>
                        {isActionable && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => handleDisputeAction(dispute.id, 'resolve')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors whitespace-nowrap"><CheckCircle size={12} /> Resolve</button>
                            <button onClick={() => handleDisputeAction(dispute.id, 'partial_payout')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg font-medium transition-colors whitespace-nowrap"><DollarSign size={12} /> Partial Payout</button>
                            <button onClick={() => handleDisputeAction(dispute.id, 'refund')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-medium transition-colors whitespace-nowrap"><RotateCcw size={12} /> Refund</button>
                            {currentStatus !== 'escalated' && <button onClick={() => handleDisputeAction(dispute.id, 'escalate')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap"><ArrowUpRight size={12} /> Escalate</button>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredDisputes.length === 0 && (
                  <div className="px-5 py-12 text-center"><CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" /><p className="text-sm text-slate-500">No disputes in this category</p></div>
                )}
              </div>
            </div>
          )}

          {/* ── AI MATCHING TAB ───────────────────────────────────────────── */}
          {activeTab === 'ai-matching' && (
            <div>
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">AI Match Logs</p>
                  <p className="text-xs text-slate-400 mt-0.5">Review AI-recommended creator-campaign pairings and override when needed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"><Zap size={11} /> {aiMatches.filter(m => matchStatuses[m.id] === 'active').length} active</span>
                  <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg font-medium">{aiMatches.filter(m => matchStatuses[m.id] === 'removed').length} removed</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {aiMatches.map(match => {
                  const currentStatus = matchStatuses[match.id];
                  return (
                    <div key={match.id} className={`px-5 py-4 hover:bg-slate-50/60 transition-colors ${currentStatus === 'removed' ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${match.matchScore >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : match.matchScore >= 75 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              <Zap size={11} /> {match.matchScore}% match
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentStatus === 'active' ? 'bg-emerald-50 text-emerald-700' : currentStatus === 'force_matched' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                              {currentStatus === 'force_matched' ? 'Force Matched' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                              <span className="text-violet-700 text-xs font-bold">{match.creatorName.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{match.creatorName}</p>
                              <p className="text-xs text-slate-500">{match.creatorNiche} · {(match.followers / 1000).toFixed(1)}K followers · {match.engagement}% eng.</p>
                            </div>
                            <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{match.campaignTitle}</p>
                              <p className="text-xs text-slate-400">Matched {match.matchedAt}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {match.reasons.map((reason, i) => (
                              <span key={`reason-${match.id}-${i}`} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">{reason}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {currentStatus !== 'force_matched' && <button onClick={() => handleMatchAction(match.id, 'force_match')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg font-medium transition-colors whitespace-nowrap"><GitMerge size={12} /> Force Match</button>}
                          {currentStatus !== 'removed' ? (
                            <button onClick={() => handleMatchAction(match.id, 'remove')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors whitespace-nowrap"><XCircle size={12} /> Remove</button>
                          ) : (
                            <button onClick={() => handleMatchAction(match.id, 'force_match')} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors whitespace-nowrap"><RefreshCw size={12} /> Restore</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: '₹148,200', sub: '+18.4% MoM', color: 'text-violet-700', bg: 'bg-violet-50', icon: <TrendingUp size={15} className="text-violet-500" /> },
                  { label: 'Avg Campaign ROI', value: '3.1x', sub: 'Across all brands', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <ArrowUpRight size={15} className="text-emerald-500" /> },
                  { label: 'Completion Rate', value: '79.7%', sub: '94 of 118 submitted', color: 'text-blue-700', bg: 'bg-blue-50', icon: <CheckCircle size={15} className="text-blue-500" /> },
                  { label: 'Avg Time to Complete', value: '18 days', sub: 'Campaign lifecycle', color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock size={15} className="text-amber-500" /> },
                ].map(kpi => (
                  <div key={kpi.label} className={`${kpi.bg} rounded-xl p-4 border border-slate-100`}>
                    <div className="flex items-center justify-between mb-2">{kpi.icon}<span className="text-xs text-slate-500">{kpi.label}</span></div>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Revenue by Category</h3>
                  <p className="text-xs text-slate-400 mb-4">GMV breakdown across content niches</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueByCategory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#7C3AED" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Revenue by Platform</h3>
                  <p className="text-xs text-slate-400 mb-4">GMV share across social platforms</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={revenueByPlatform} dataKey="revenue" nameKey="platform" cx="50%" cy="50%" outerRadius={75} label={({ platform, share }: { platform: string; share: number }) => `${platform} ${share}%`} labelLine={false} fontSize={10}>
                        {revenueByPlatform.map((entry, index) => (
                          <Cell key={`cell-rev-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Conversion Funnel</h3>
                <p className="text-xs text-slate-400 mb-5">Campaign lifecycle: from posted to completed</p>
                <div className="space-y-3">
                  {conversionFunnel.map((stage, i) => {
                    const maxVal = conversionFunnel[0].value;
                    const pct = Math.round((stage.value / maxVal) * 100);
                    const convRate = i > 0 ? Math.round((stage.value / conversionFunnel[i - 1].value) * 100) : 100;
                    return (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="w-44 text-right"><p className="text-xs font-medium text-slate-600 truncate">{stage.stage}</p></div>
                        <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                          <div className="h-full rounded-full flex items-center px-3 transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: stage.color }}>
                            <span className="text-white text-xs font-bold tabular-nums">{stage.value.toLocaleString()}</span>
                          </div>
                        </div>
                        {i > 0 ? (
                          <div className="w-16 text-right"><span className={`text-xs font-semibold ${convRate >= 70 ? 'text-emerald-600' : convRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{convRate}%</span></div>
                        ) : <div className="w-16" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Monthly Revenue Trend</h3>
                <p className="text-xs text-slate-400 mb-4">GMV vs platform fees — last 6 months</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number, name: string) => [`₹${v.toLocaleString()}`, name === 'gmv' ? 'GMV' : 'Platform Fees']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="gmv" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 3 }} />
                    <Line type="monotone" dataKey="fees" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Star size={14} className="text-amber-500" /> Top Creators</h3>
                  <div className="space-y-3">
                    {topCreators.map((creator, i) => (
                      <div key={creator.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4 tabular-nums">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-violet-700 text-xs font-bold">{creator.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{creator.name}</p>
                          <p className="text-xs text-slate-400">{creator.niche} · {creator.collabs} collabs</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-700 tabular-nums">₹{creator.earnings.toLocaleString()}</p>
                          <p className="text-xs text-amber-600">★ {creator.rating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-blue-500" /> Top Brands</h3>
                  <div className="space-y-3">
                    {topBrands.map((brand, i) => (
                      <div key={brand.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4 tabular-nums">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{brand.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{brand.name}</p>
                          <p className="text-xs text-slate-400">{brand.campaigns} campaigns</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-700 tabular-nums">₹{brand.spend.toLocaleString()}</p>
                          <p className="text-xs text-emerald-600">{brand.avgROI}x ROI</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── WITHDRAWALS TAB ───────────────────────────────────────────── */}
          {activeTab === 'withdrawals' && (
            <div>
              {pendingWithdrawals > 0 && (
                <div className="mx-5 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700 font-medium">{pendingWithdrawals} withdrawal{pendingWithdrawals !== 1 ? 's' : ''} pending approval</p>
                </div>
              )}
              <div className="overflow-x-auto mt-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Creator', 'Amount', 'Net Payout', 'Method', 'Account', 'Status', 'Requested', 'Actions'].map(col => (
                        <th key={`wd-th-${col}`} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {adminWithdrawals.map(wd => {
                      const currentStatus = withdrawalStatuses[wd.id];
                      return (
                        <tr key={wd.id} className={`hover:bg-slate-50/60 transition-colors group ${currentStatus === 'pending' ? 'bg-amber-50/20' : ''}`}>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-medium text-slate-800">{wd.creator}</p>
                            <p className="text-xs text-slate-400 font-mono">{wd.email}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm font-bold text-slate-800 tabular-nums">₹{wd.amount.toLocaleString()}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-sm font-semibold text-emerald-700 tabular-nums">₹{(wd.amount - wd.fee).toFixed(2)}</p>
                            <p className="text-xs text-slate-400">fee: ₹{wd.fee.toFixed(2)}</p>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-600">{wd.method}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs font-mono text-slate-500">{wd.account}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={currentStatus as 'pending' | 'approved' | 'rejected'} /></td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-sm text-slate-500">{wd.requestedAt}</p></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {currentStatus === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleWithdrawal(wd.id, 'approved')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors"><CheckCircle size={12} /> Approve</button>
                                <button onClick={() => handleWithdrawal(wd.id, 'rejected')} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"><XCircle size={12} /> Reject</button>
                              </div>
                            ) : <span className="text-xs text-slate-400 capitalize">{currentStatus}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Live Activity Feed — 25% */}
        <div className="xl:col-span-1">
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
}