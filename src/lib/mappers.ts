/** Normalize paginated `{ data, meta }` or plain array API responses */
export function extractList<T = unknown>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data: unknown }).data;
    return Array.isArray(data) ? (data as T[]) : [];
  }
  return [];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CR';
}

export function mapCampaignStatus(
  status: string,
): 'active' | 'draft' | 'completed' | 'in_progress' {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 'active';
  if (s === 'COMPLETED') return 'completed';
  if (s === 'DRAFT' || s === 'PENDING_APPROVAL') return 'draft';
  return 'in_progress';
}

export function mapApplicantUiStatus(
  status: string,
): 'pending' | 'approved' | 'rejected' | 'shortlisted' {
  const s = (status || '').toUpperCase();
  if (s === 'ACCEPTED') return 'approved';
  if (s === 'REJECTED') return 'rejected';
  if (s === 'SHORTLISTED') return 'shortlisted';
  return 'pending';
}

export interface BrandCampaignRow {
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

export function mapBrandCampaign(raw: Record<string, unknown>): BrandCampaignRow {
  const apps = (raw.applications as Record<string, unknown>[]) ?? [];
  const pending = apps.filter((a) => String(a.status).toUpperCase() === 'PENDING').length;
  const accepted = apps.filter((a) => String(a.status).toUpperCase() === 'ACCEPTED').length;
  const budget = Number(raw.budget) || 0;
  const remaining = Number(raw.remaining_budget ?? raw.budget) || 0;
  const count = (raw._count as { applications?: number })?.applications;

  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    platform: String(raw.platform ?? 'Instagram'),
    niche: String(raw.locality ?? 'General'),
    budget,
    spent: Math.max(0, budget - remaining),
    deadline: String(raw.deadline ?? '').slice(0, 10),
    status: mapCampaignStatus(String(raw.status ?? '')),
    applicants: apps.length || count || 0,
    accepted,
    pending,
    deliverables: Array.isArray(raw.deliverables) ? (raw.deliverables as string[]) : [],
    createdAt: String(raw.created_at ?? '').slice(0, 10),
  };
}

export interface BrandApplicantRow {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: string;
  niche: string;
  followers: number;
  engagementRate: number;
  campaign: string;
  campaignId: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'shortlisted';
  bio: string;
  pastCollabs: number;
  avgROI: string;
}

export function mapBrandApplicant(
  raw: Record<string, unknown>,
  campaign?: Record<string, unknown>,
): BrandApplicantRow {
  const creator = (raw.creator as Record<string, unknown>) ?? {};
  const user = (creator.user as Record<string, unknown>) ?? {};
  const social = (creator.social_links as Record<string, string>) ?? {};
  const handleRaw = social.instagram || social.youtube || social.tiktok || String(user.email ?? 'creator');
  const name = String(creator.full_name || user.name || 'Creator');

  return {
    id: String(raw.id),
    name,
    handle: handleRaw.startsWith('@') ? handleRaw : `@${String(handleRaw).replace('@', '')}`,
    avatar: initials(name),
    platform: String((campaign?.platform as string) ?? raw.platform ?? 'Instagram'),
    niche: String(creator.niche ?? 'General'),
    followers: Number(creator.followers) || 0,
    engagementRate: Number(creator.engagement_rate) || 0,
    campaign: String((campaign?.title as string) ?? (raw.campaign as Record<string, unknown>)?.title ?? ''),
    campaignId: String(raw.campaign_id ?? campaign?.id ?? ''),
    appliedAt: String(raw.created_at ?? '').slice(0, 10),
    status: mapApplicantUiStatus(String(raw.status ?? '')),
    bio: String(creator.bio ?? raw.message ?? ''),
    pastCollabs: 0,
    avgROI: '—',
  };
}

export interface DiscoveryCampaignRow {
  id: string;
  title: string;
  brand: string;
  brandLogo: string;
  platform: string;
  niche: string;
  budget: number;
  budgetPer: string;
  deadline: string;
  applicants: number;
  slots: number;
  description: string;
  deliverables: string[];
  engagementMin: number;
  followersMin: number;
  status: 'active' | 'in_progress';
  featured: boolean;
  locality: string;
  language: string;
  aiMatchScore: number;
  approvalChance: 'High' | 'Medium' | 'Low';
  matchReason: string;
  earnAmount: number;
  verifiedBrand: boolean;
  escrowProtected: boolean;
  avgPaymentDays: number;
  creatorRating: number;
  totalCreatorsEarned: string;
  previouslySelected: number;
  creatorSatisfaction: number;
  viewingNow: number;
  category: 'recommended' | 'trending' | 'high_budget' | 'easy_approval' | 'new_brand' | 'fast_paying';
  brandSize: string;
  paymentType: string;
}

export function mapDiscoveryCampaign(raw: Record<string, unknown>): DiscoveryCampaignRow {
  const brand = (raw.brand as Record<string, unknown>) ?? {};
  const brandName = String(brand.company_name ?? 'Brand');
  const budget = Number(raw.budget) || 0;
  const applicantCount =
    Number((raw._count as { applications?: number })?.applications) ||
    ((raw.applications as unknown[])?.length ?? 0);
  const langs = Array.isArray(raw.languages) ? (raw.languages as string[]) : ['English'];

  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    brand: brandName,
    brandLogo: initials(brandName),
    platform: String(raw.platform ?? 'Instagram'),
    niche: String(raw.locality ?? 'General'),
    budget,
    budgetPer: 'per creator',
    deadline: String(raw.deadline ?? '').slice(0, 10),
    applicants: applicantCount,
    slots: Math.max(3, Math.ceil(applicantCount / 4) + 2),
    description: String(raw.description ?? ''),
    deliverables: Array.isArray(raw.deliverables) ? (raw.deliverables as string[]) : [],
    engagementMin: 3,
    followersMin: 5000,
    status: 'active',
    featured: budget >= 2000,
    locality: String(raw.locality ?? 'Global'),
    language: langs[0] ?? 'English',
    aiMatchScore: Math.min(97, 70 + Math.floor(budget / 200)),
    approvalChance: applicantCount < 20 ? 'High' : applicantCount < 50 ? 'Medium' : 'Low',
    matchReason: `Campaign budget $${budget.toLocaleString()} — ${String(raw.platform ?? 'social')} content`,
    earnAmount: budget,
    verifiedBrand: Boolean(brand.user_id),
    escrowProtected: true,
    avgPaymentDays: 5,
    creatorRating: 4.5,
    totalCreatorsEarned: '—',
    previouslySelected: Math.floor(applicantCount / 3),
    creatorSatisfaction: 4.5,
    viewingNow: Math.max(1, applicantCount % 10),
    category: budget >= 3000 ? 'high_budget' : applicantCount < 15 ? 'easy_approval' : 'recommended',
    brandSize: 'D2C',
    paymentType: 'Fixed',
  };
}

export interface CreatorApplicationRow {
  id: string;
  campaignTitle: string;
  brand: string;
  brandAvatar: string;
  platform: string;
  budget: number;
  appliedAt: string;
  status: 'pending' | 'shortlisted' | 'approved' | 'rejected' | 'completed';
  deliverables: string[];
  deadline: string;
  paymentStatus?: 'pending' | 'in_escrow' | 'released';
  paymentAmount?: number;
  feedback?: string;
}

export function mapCreatorApplication(raw: Record<string, unknown>): CreatorApplicationRow {
  const campaign = (raw.campaign as Record<string, unknown>) ?? {};
  const brand = (campaign.brand as Record<string, unknown>) ?? {};
  const brandName = String(brand.company_name ?? 'Brand');
  const statusRaw = String(raw.status ?? '').toUpperCase();
  let status: CreatorApplicationRow['status'] = 'pending';
  if (statusRaw === 'ACCEPTED') status = 'approved';
  else if (statusRaw === 'REJECTED') status = 'rejected';
  else if (statusRaw === 'SHORTLISTED') status = 'shortlisted';
  else if (statusRaw === 'COMPLETED') status = 'completed';

  return {
    id: String(raw.id),
    campaignTitle: String(campaign.title ?? ''),
    brand: brandName,
    brandAvatar: initials(brandName),
    platform: String(campaign.platform ?? 'Instagram'),
    budget: Number(raw.proposed_price ?? campaign.budget) || 0,
    appliedAt: String(raw.created_at ?? '').slice(0, 10),
    status,
    deliverables: Array.isArray(campaign.deliverables) ? (campaign.deliverables as string[]) : [],
    deadline: String(campaign.deadline ?? '').slice(0, 10),
    paymentStatus: status === 'approved' ? 'in_escrow' : undefined,
    paymentAmount: Number(raw.proposed_price ?? campaign.budget) || undefined,
    feedback: status === 'rejected' ? String(raw.message ?? '') : undefined,
  };
}

export interface CreatorCardRow {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  niche: string;
  platform: string;
  followers: number;
  engagementRate: number;
  avgViews: number;
  location: string;
  language: string;
  pricePerPost: number;
  rating: number;
  pastCollabs: number;
  bio: string;
  tags: string[];
  verified: boolean;
}

export interface AdminPanelUser {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'brand';
  status: 'active' | 'suspended' | 'pending_kyc' | 'banned' | 'verified';
  kycStatus: 'verified' | 'pending' | 'not_submitted' | 'rejected';
  joinedAt: string;
  totalEarnings?: number;
  totalSpend?: number;
  campaigns?: number;
  collabs?: number;
  followers?: number;
  lastActive: string;
  activityLog: { date: string; action: string }[];
}

export function mapAdminUser(raw: Record<string, unknown>): AdminPanelUser | null {
  const roleName = String((raw.role as { name?: string })?.name ?? '').toUpperCase();
  if (roleName !== 'CREATOR' && roleName !== 'BRAND') return null;

  const role = roleName === 'BRAND' ? 'brand' : 'creator';
  const isBanned = Boolean(raw.is_banned);
  const isVerified = Boolean(raw.is_verified);
  const statusRaw = String(raw.status ?? 'ACTIVE').toUpperCase();

  let status: AdminPanelUser['status'] = 'active';
  if (isBanned) status = 'banned';
  else if (statusRaw === 'SUSPENDED') status = 'suspended';
  else if (!isVerified) status = 'pending_kyc';

  let kycStatus: AdminPanelUser['kycStatus'] = 'not_submitted';
  if (isVerified) kycStatus = 'verified';
  else if (statusRaw === 'PENDING' || statusRaw === 'PENDING_KYC') kycStatus = 'pending';

  const creatorProfile = raw.creator_profile as Record<string, unknown> | null;
  const brandProfile = raw.brand_profile as Record<string, unknown> | null;
  const wallet = ((raw.wallets as Record<string, unknown>[]) ?? [])[0];
  const balance = Number(wallet?.available_balance ?? 0) + Number(wallet?.pending_balance ?? 0);
  const joinedAt = String(raw.created_at ?? '').slice(0, 10);

  return {
    id: String(raw.id),
    name: role === 'brand' && brandProfile?.company_name
      ? String(brandProfile.company_name)
      : String(raw.name),
    email: String(raw.email),
    role,
    status,
    kycStatus,
    joinedAt,
    lastActive: String(raw.updated_at ?? raw.created_at ?? '').slice(0, 10),
    totalEarnings: role === 'creator' ? balance : undefined,
    totalSpend: role === 'brand' ? balance : undefined,
    collabs: Number((creatorProfile?._count as { applications?: number })?.applications ?? 0),
    followers: Number(creatorProfile?.followers ?? 0),
    campaigns: Number((brandProfile?._count as { campaigns?: number })?.campaigns ?? 0),
    activityLog: [{ date: joinedAt, action: 'Account created' }],
  };
}

export function mapAdminUsers(raw: unknown): AdminPanelUser[] {
  return extractList<Record<string, unknown>>(raw)
    .map(mapAdminUser)
    .filter((user): user is AdminPanelUser => user !== null);
}

export function mapCreatorCard(raw: Record<string, unknown>): CreatorCardRow {
  const user = (raw.user as Record<string, unknown>) ?? {};
  const social = (raw.social_links as Record<string, string>) ?? {};
  const handleRaw = social.instagram || social.youtube || social.tiktok || String(user.email ?? 'creator');
  const name = String(raw.full_name || user.name || 'Creator');
  const langs = Array.isArray(raw.languages) ? (raw.languages as string[]) : ['English'];

  return {
    id: String(raw.id),
    name,
    handle: handleRaw.startsWith('@') ? handleRaw : `@${String(handleRaw).replace('@', '')}`,
    avatar: initials(name),
    niche: String(raw.niche ?? 'General'),
    platform: social.instagram ? 'Instagram' : social.youtube ? 'YouTube' : social.tiktok ? 'TikTok' : 'Instagram',
    followers: Number(raw.followers) || 0,
    engagementRate: Number(raw.engagement_rate) || 0,
    avgViews: Math.round((Number(raw.followers) || 0) * 0.6),
    location: String(raw.locality ?? 'Global'),
    language: langs.join(', '),
    pricePerPost: Math.round((Number(raw.followers) || 10000) / 40),
    rating: 4.5,
    pastCollabs: 0,
    bio: String(raw.bio ?? ''),
    tags: [String(raw.niche ?? 'creator')],
    verified: Boolean(user.is_verified),
  };
}
