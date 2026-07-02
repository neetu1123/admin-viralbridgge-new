// ─── Centralized API Client ───────────────────────────────────────────────────
// All backend calls go through this file. It automatically attaches the JWT
// token from localStorage and handles 401 (auto-logout) gracefully.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  attempt = 1
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The API may still be starting — try again in a few seconds.');
    }
    throw new Error('Cannot reach API. Redeploy the backend and confirm NEXT_PUBLIC_API_URL is correct.');
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 503 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 3000));
    return apiFetch<T>(path, options, attempt + 1);
  }

  if (res.status === 401) {
    // Token expired or invalid — clear and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/sign-up-login-screen');
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return (json?.success === true && 'data' in json ? json.data : json) as T;
}

/** Multipart upload — do not set Content-Type (browser sets boundary). */
async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/sign-up-login-screen');
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }

  const json = await res.json();
  return (json?.success === true && 'data' in json ? json.data : json) as T;
}

function toQuery(params?: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user: { id: string; name: string; email: string; role?: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (name: string, email: string, password: string, role: string) =>
    apiFetch<{ access_token: string; user: { id: string; name: string; email: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password, role }) }
    ),

  me: () => apiFetch<{ id: string; name: string; email: string; role?: { name: string } }>('/auth/me'),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ─── Admin APIs ───────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboardStats: () =>
    apiFetch<{ totalUsers: number; totalCampaigns: number; gmv: number }>('/admin/dashboard/stats'),

  getUsers: () =>
    apiFetch<Array<{
      id: string; name: string; email: string; status: string; is_banned: boolean;
      is_verified: boolean; created_at: string; updated_at: string;
      role?: { name: string };
      creator_profile?: { followers: number; _count?: { applications: number } } | null;
      brand_profile?: { company_name: string; _count?: { campaigns: number } } | null;
      wallets?: Array<{ available_balance: number; pending_balance: number }>;
    }>>('/admin/users'),

  getUser: (id: string) => apiFetch(`/admin/users/${id}`),

  banUser: (id: string) => apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH' }),

  unbanUser: (id: string) => apiFetch(`/admin/users/${id}/unban`, { method: 'PATCH' }),

  updateUserRole: (id: string, role_id: string) =>
    apiFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role_id }) }),

  getCampaigns: () =>
    apiFetch<Array<{
      id: string; title: string; status: string; budget: number; platform: string;
      deadline: string; created_at: string;
      brand?: { company_name: string };
    }>>('/admin/campaigns'),

  getFlaggedCampaigns: () => apiFetch('/admin/campaigns/flagged'),

  approveCampaign: (id: string) => apiFetch(`/admin/campaigns/${id}/approve`, { method: 'POST' }),

  rejectCampaign: (id: string) => apiFetch(`/admin/campaigns/${id}/reject`, { method: 'POST' }),

  getTransactions: () =>
    apiFetch<Array<{
      id: string; type: string; amount: number; status: string; created_at: string;
      wallet?: { user?: { name: string; email: string } };
    }>>('/admin/transactions'),

  getSettings: () =>
    apiFetch<{ aiMatchingEnabled: boolean; updatedAt?: string }>('/admin/settings'),

  patchSettings: (body: { aiMatchingEnabled?: boolean }) =>
    apiFetch<{ aiMatchingEnabled: boolean; updatedAt?: string }>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getMatches: () =>
    apiFetch<{
      enabled: boolean;
      matches: Array<{
        id: string;
        campaignTitle: string;
        campaignId: string;
        creatorName: string;
        creatorNiche: string;
        matchScore: number;
        reasons: string[];
        status: 'active' | 'removed' | 'force_matched';
        matchedAt: string;
        engagement: number;
        followers: number;
      }>;
    }>('/admin/matching'),

  updateMatch: (id: string, status: 'active' | 'removed' | 'forced') =>
    apiFetch(`/admin/matching/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  runMatching: () =>
    apiFetch<{ totalCreated: number; campaigns: number; enabled: boolean }>('/admin/matching/run', {
      method: 'POST',
    }),

  getDisputes: (params?: { status?: string; priority?: string; raised_by?: string; page?: number; limit?: number }) =>
    apiFetch<{
      data: AdminDisputeApi[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/disputes${toQuery(params)}`),

  getDisputeStats: () =>
    apiFetch<{ openCount: number; totalAtStake: number; resolvedCount: number }>('/admin/disputes/stats'),

  getDispute: (id: string) => apiFetch<AdminDisputeApi>(`/admin/disputes/${id}`),

  escalateDispute: (id: string, notes?: string) =>
    apiFetch<AdminDisputeApi>(`/admin/disputes/${id}/escalate`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  resolveDispute: (id: string, notes?: string) =>
    apiFetch<AdminDisputeApi>(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  refundDispute: (id: string, notes?: string) =>
    apiFetch<AdminDisputeApi>(`/admin/disputes/${id}/refund`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  partialPayoutDispute: (
    id: string,
    body: { creatorAmount: number; brandAmount: number; notes?: string },
  ) =>
    apiFetch<AdminDisputeApi>(`/admin/disputes/${id}/partial-payout`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getKycRequests: (params?: { status?: string; user_type?: string; page?: number; limit?: number }) =>
    apiFetch<{
      data: KycRequestApi[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/kyc${toQuery(params)}`),

  approveKyc: (id: string, remarks?: string) =>
    apiFetch(`/admin/kyc/${id}/approve`, { method: 'POST', body: JSON.stringify({ remarks }) }),

  rejectKyc: (id: string, remarks?: string) =>
    apiFetch(`/admin/kyc/${id}/reject`, { method: 'POST', body: JSON.stringify({ remarks }) }),

  getNotifications: (params?: { page?: number; limit?: number; type?: string; unread?: boolean }) =>
    apiFetch<NotificationListResponse>(`/admin/notifications${toQuery(params)}`),

  getUnreadNotificationCount: () =>
    apiFetch<{ count: number }>('/admin/notifications/unread-count'),

  markNotificationRead: (id: string) =>
    apiFetch(`/admin/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    apiFetch('/admin/notifications/read-all', { method: 'PATCH' }),

  getWithdrawals: (status = 'PENDING') =>
    apiFetch(`/admin/withdrawals${toQuery({ status })}`),

  approveWithdrawal: (id: string) =>
    apiFetch(`/admin/withdrawals/${id}/approve`, { method: 'PATCH' }),

  rejectWithdrawal: (id: string, reason?: string) =>
    apiFetch(`/admin/withdrawals/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),

  inviteAdmin: (body: { email: string; role_id: string; password?: string; name?: string }) =>
    apiFetch('/admin/invite-admin', { method: 'POST', body: JSON.stringify(body) }),

  searchBrands: (params?: { search?: string; industry?: string; status?: string; verified?: string; page?: number; limit?: number }) =>
    apiFetch<{
      data: Array<{
        id: string;
        userId: string;
        companyName: string;
        contactPerson: string;
        email: string;
        phone?: string;
        website?: string;
        industry?: string;
        status: string;
        verified: boolean;
        campaignCount: number;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/brands${toQuery(params)}`),

  getBrandDetail: (id: string) =>
    apiFetch<{
      profile: Record<string, unknown>;
      wallet: { availableBalance: number; pendingBalance: number };
      kycStatus: string;
      activeCampaigns: unknown[];
      completedCampaigns: unknown[];
      totalCampaigns: number;
    }>(`/admin/brands/${id}`),

  createCampaignForBrand: (body: Record<string, unknown>) =>
    apiFetch('/admin/campaigns/create-for-brand', { method: 'POST', body: JSON.stringify(body) }),

  createCampaignWithBrand: (body: Record<string, unknown>) =>
    apiFetch<{ campaign: { id: string; title: string }; brand: Record<string, unknown>; invitationNote?: string }>(
      '/admin/campaigns/create-with-brand',
      { method: 'POST', body: JSON.stringify(body) },
    ),
};

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface KycRequestApi {
  id: string;
  user_id: string;
  user_type: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string | null;
  remarks?: string | null;
  user?: { id: string; name: string; email: string; role?: { name: string } };
  creator_kyc?: Record<string, unknown> | null;
  brand_kyc?: Record<string, unknown> | null;
}

export const kycApi = {
  getStatus: () => apiFetch('/kyc/status'),
  submitCreator: (body: Record<string, unknown>) =>
    apiFetch('/kyc/creator/submit', { method: 'POST', body: JSON.stringify(body) }),
  submitBrand: (body: Record<string, unknown>) =>
    apiFetch('/kyc/brand/submit', { method: 'POST', body: JSON.stringify(body) }),
};

export interface AdminDisputeApi {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creator: string;
  brand: string;
  reason: string;
  amount: number;
  status: 'open' | 'escalated' | 'resolved' | 'refunded';
  openedAt: string;
  priority: 'high' | 'medium' | 'low';
  raisedBy: 'brand' | 'creator';
  resolutionNotes?: string | null;
  payoutCreatorAmount?: number | null;
  payoutBrandAmount?: number | null;
  resolvedAt?: string | null;
}

export const platformApi = {
  getPublicSettings: () =>
    apiFetch<{ aiMatchingEnabled: boolean }>('/settings/public'),
};

// ─── Audit Log APIs ───────────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin: { id: string; name: string; email: string };
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogStats {
  total: number;
  today: number;
  byEntity: Array<{ entity: string; _count: { entity: number } }>;
}

export const auditApi = {
  getLogs: (params?: {
    page?: number;
    limit?: number;
    entity?: string;
    action?: string;
    admin_id?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.entity) qs.set('entity', params.entity);
    if (params?.action) qs.set('action', params.action);
    if (params?.admin_id) qs.set('admin_id', params.admin_id);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiFetch<AuditLogResponse>(`/admin/audit-logs${query}`);
  },

  getStats: () => apiFetch<AuditLogStats>('/admin/audit-logs/stats'),

  createLog: (body: {
    action: string;
    entity: string;
    entity_id: string;
    metadata?: Record<string, unknown>;
  }) => apiFetch('/admin/audit-logs', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Roles API ────────────────────────────────────────────────────────────────
export const rolesApi = {
  getRoles: () => apiFetch<Array<{ id: string; name: string; description: string; _count?: { users: number } }>>('/admin/roles'),
  createRole: (data: { name: string; description: string }) => apiFetch('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: { name: string; description: string }) => apiFetch(`/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: string) => apiFetch(`/admin/roles/${id}`, { method: 'DELETE' }),
  
  getAdmins: () => apiFetch<Array<{ id: string; name: string; email: string; role?: { name: string }; status: string }>>('/admin/admins'),
  assignAdminRole: (data: { email: string; role_id: string; password?: string; name?: string }) => apiFetch('/admin/admins/assign', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Brand APIs ───────────────────────────────────────────────────────────────
export const brandApi = {
  getProfile: () => apiFetch('/brand/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch('/brand/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return apiUpload<{ logo?: string; url?: string }>('/brand/upload-logo', form);
  },

  createCampaign: (data: Record<string, unknown>) =>
    apiFetch('/brand/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  getCampaigns: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/brand/campaigns${toQuery(params)}`),
  getCampaign: (id: string) => apiFetch(`/brand/campaigns/${id}`),
  updateCampaign: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/brand/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => apiFetch(`/brand/campaigns/${id}`, { method: 'DELETE' }),
  getApplicants: (campaignId: string) => apiFetch(`/brand/campaigns/${campaignId}/applicants`),
  approveApplication: (id: string) => apiFetch(`/brand/applications/${id}/approve`, { method: 'POST' }),
  rejectApplication: (id: string) => apiFetch(`/brand/applications/${id}/reject`, { method: 'POST' }),
  shortlistApplication: (id: string) => apiFetch(`/brand/applications/${id}/shortlist`, { method: 'POST' }),
  inviteCreator: (campaignId: string, creatorId: string) =>
    apiFetch(`/brand/campaigns/${campaignId}/invite/${creatorId}`, { method: 'POST' }),
  getCampaignDetail: (id: string) => apiFetch(`/brand/campaigns/${id}/detail`),
  getCampaignRecommendations: (campaignId: string) =>
    apiFetch<{
      enabled: boolean;
      recommendations: Array<{
        id: string;
        name: string;
        niche: string;
        followers: number;
        engagementRate: number;
        matchScore: number;
        matchReason: string;
        reasons: string[];
        platform: string;
        verified: boolean;
      }>;
    }>(`/brand/campaigns/${campaignId}/recommendations`),
  getCreators: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/brand/creators${toQuery(params)}`),
  getMyCreators: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/brand/my-creators${toQuery(params)}`),
  getCampaignDeliverables: (campaignId: string) =>
    apiFetch(`/brand/campaigns/${campaignId}/deliverables`),
  approveDeliverable: (id: string) =>
    apiFetch(`/brand/deliverables/${id}/approve`, { method: 'POST' }),
  reviseDeliverable: (id: string, notes: string) =>
    apiFetch(`/brand/deliverables/${id}/revise`, { method: 'POST', body: JSON.stringify({ notes }) }),
  rejectDeliverable: (id: string, notes?: string) =>
    apiFetch(`/brand/deliverables/${id}/reject`, { method: 'POST', body: JSON.stringify({ notes }) }),
  fundEscrow: (body: { campaign_id: string; creator_id: string; amount?: number }) =>
    apiFetch('/brand/escrows/fund', { method: 'POST', body: JSON.stringify(body) }),
  releaseEscrow: (id: string) => apiFetch(`/brand/escrows/${id}/release`, { method: 'POST' }),

  openDispute: (body: { campaign_id: string; creator_id: string; reason: string }) =>
    apiFetch('/brand/disputes', { method: 'POST', body: JSON.stringify(body) }),
  getDisputes: () => apiFetch<AdminDisputeApi[]>('/brand/disputes'),
  getEscrows: () =>
    apiFetch<Array<{
      id: string;
      campaignId: string;
      campaignTitle: string;
      creatorId: string;
      creatorName: string;
      amount: number;
      status: string;
      hasOpenDispute: boolean;
      canDispute: boolean;
      createdAt: string;
    }>>('/brand/escrows'),

  getDashboard: () => apiFetch('/brand/dashboard'),
  getWallet: () => apiFetch<{ available_balance: number; pending_balance: number }>('/brand/wallet'),
  getRazorpayKey: () => apiFetch<{ keyId: string | null }>('/brand/wallet/razorpay-key'),
  createPaymentOrder: (amount: number) =>
    apiFetch<{ orderId: string; amount: number; keyId: string | null; mock?: boolean }>(
      '/brand/wallet/create-order',
      { method: 'POST', body: JSON.stringify({ amount }) },
    ),
  verifyPayment: (body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiFetch('/brand/wallet/verify-payment', { method: 'POST', body: JSON.stringify(body) }),
  addFunds: (amount: number) =>
    apiFetch('/brand/wallet/add-funds', { method: 'POST', body: JSON.stringify({ amount }) }),
  getTransactions: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/brand/wallet/transactions${toQuery(params)}`),
  getAnalytics: () => apiFetch('/brand/analytics'),
  getRoi: () => apiFetch('/brand/analytics/roi'),
  getTopCreators: () => apiFetch('/brand/analytics/top-creators'),

  getConversations: () => apiFetch('/brand/conversations'),
  getMessages: (conversationId: string) => apiFetch(`/brand/messages/${conversationId}`),
  sendMessage: (data: { conversationId: string; message: string }) =>
    apiFetch('/brand/messages/send', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: (params?: { page?: number; limit?: number; type?: string; unread?: boolean }) =>
    apiFetch<NotificationListResponse>(`/brand/notifications${toQuery(params)}`),
  getUnreadNotificationCount: () =>
    apiFetch<{ count: number }>('/brand/notifications/unread-count'),
  markNotificationRead: (id: string) =>
    apiFetch(`/brand/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiFetch('/brand/notifications/read-all', { method: 'PATCH' }),
  getSettings: () => apiFetch('/brand/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    apiFetch('/brand/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Creator APIs ─────────────────────────────────────────────────────────────
export const creatorApi = {
  getProfile: () => apiFetch('/creator/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    apiFetch('/creator/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return apiUpload<{ photo?: string; url?: string }>('/creator/upload-photo', form);
  },
  uploadPhotoByUrl: (url: string) =>
    apiFetch('/creator/upload-photo', { method: 'POST', body: JSON.stringify({ url }) }),
  uploadMediaKit: (url: string) =>
    apiFetch('/creator/upload-media-kit', { method: 'POST', body: JSON.stringify({ url }) }),

  getCampaigns: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/creator/campaigns${toQuery(params)}`),
  getCampaign: (id: string) => apiFetch(`/creator/campaigns/${id}`),
  apply: (campaignId: string, data: { message?: string; proposedPrice?: number }) =>
    apiFetch(`/creator/apply/${campaignId}`, { method: 'POST', body: JSON.stringify(data) }),
  getApplications: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/creator/applications${toQuery(params)}`),
  getApplication: (id: string) => apiFetch(`/creator/applications/${id}`),
  getDeliverables: () => apiFetch('/creator/deliverables'),
  submitDeliverable: (id: string, data: { mediaUrl: string; thumbnailUrl?: string; notes?: string }) =>
    apiFetch(`/creator/deliverables/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  submitDeliverableFile: (id: string, file: File, notes?: string, thumbnail?: File) => {
    const form = new FormData();
    form.append('file', file);
    if (notes) form.append('notes', notes);
    if (thumbnail) form.append('thumbnail', thumbnail);
    return apiUpload(`/creator/deliverables/${id}/submit-file`, form);
  },

  openDispute: (body: { campaign_id: string; reason: string }) =>
    apiFetch('/creator/disputes', { method: 'POST', body: JSON.stringify(body) }),
  getDisputes: () => apiFetch<AdminDisputeApi[]>('/creator/disputes'),
  getEscrows: () =>
    apiFetch<Array<{
      id: string;
      campaignId: string;
      campaignTitle: string;
      brandName: string;
      amount: number;
      status: string;
      hasOpenDispute: boolean;
      canDispute: boolean;
      createdAt: string;
    }>>('/creator/escrows'),

  getDashboard: () => apiFetch('/creator/dashboard'),
  getWallet: () => apiFetch('/creator/wallet'),
  sendWithdrawOtp: () =>
    apiFetch<{ sent: boolean; expiresAt: string }>('/creator/wallet/withdraw-otp', { method: 'POST' }),
  withdraw: (amount: number, otp: string) =>
    apiFetch('/creator/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, otp }) }),
  getTransactions: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/creator/wallet/transactions${toQuery(params)}`),

  getConversations: () => apiFetch('/creator/conversations'),
  getMessages: (conversationId: string) => apiFetch(`/creator/messages/${conversationId}`),
  sendMessage: (data: { conversationId: string; message: string }) =>
    apiFetch('/creator/messages/send', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: (params?: { page?: number; limit?: number; type?: string; unread?: boolean }) =>
    apiFetch<NotificationListResponse>(`/creator/notifications${toQuery(params)}`),
  getUnreadNotificationCount: () =>
    apiFetch<{ count: number }>('/creator/notifications/unread-count'),
  markNotificationRead: (id: string) =>
    apiFetch(`/creator/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiFetch('/creator/notifications/read-all', { method: 'PATCH' }),
  getSettings: () => apiFetch('/creator/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    apiFetch('/creator/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Organization Team APIs (Brand & Creator) ────────────────────────────────
export type OrgType = 'BRAND' | 'CREATOR';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  roleLabel: string;
  status: string;
  lastActiveAt?: string | null;
  joinedAt: string;
  isOwner: boolean;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  roleLabel: string;
  status: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
}

export interface TeamResponse {
  organizationType: OrgType;
  organizationId: string;
  organizationName: string;
  currentUserRole: string;
  canManageTeam: boolean;
  activeMembers: TeamMember[];
  pendingInvitations: PendingInvitation[];
  availableRoles: string[];
}

export interface MyTeamInvitation extends PendingInvitation {
  token: string;
  organizationId: string;
  organizationName: string;
  organizationType: OrgType;
}

export interface InvitationPreview {
  organizationName: string;
  organizationType: OrgType;
  role: string;
  roleLabel: string;
  invitedBy: string;
  email: string;
  expiresAt: string;
  status: string;
  isExpired: boolean;
  canAccept: boolean;
}

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed (${res.status})`);
  }
  return (data as { data?: T }).data ?? (data as T);
}

export const organizationApi = {
  getTeam: () => apiFetch<TeamResponse>('/organization/team'),

  getMyInvitations: () => apiFetch<MyTeamInvitation[]>('/organization/team/invitations/mine'),

  inviteMember: (body: { email: string; role: string }) =>
    apiFetch<{ invitation: PendingInvitation; permissionPreview: { role: string; permissions: string[] }; emailSent: boolean }>(
      '/organization/team/invite',
      { method: 'POST', body: JSON.stringify(body) },
    ),

  getInvitationByToken: (token: string) =>
    publicFetch<InvitationPreview>(`/organization/team/invitation/${encodeURIComponent(token)}`),

  acceptInvitation: (token: string) =>
    apiFetch<TeamMember>('/organization/team/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  changeMemberRole: (memberId: string, role: string) =>
    apiFetch<TeamMember>(`/organization/team/member/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  removeMember: (memberId: string) =>
    apiFetch(`/organization/team/member/${memberId}`, { method: 'DELETE' }),

  reinvite: (invitationId: string) =>
    apiFetch<PendingInvitation>(`/organization/team/member/${invitationId}/reinvite`, {
      method: 'POST',
    }),

  cancelInvitation: (invitationId: string) =>
    apiFetch<PendingInvitation>(`/organization/team/invitation/${invitationId}/cancel`, {
      method: 'POST',
    }),

  getRolePermissions: (type: OrgType, role: string) =>
    apiFetch<{ role: string; permissions: string[] }>(
      `/organization/team/roles/permissions${toQuery({ type, role })}`,
    ),
};

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y';

export interface AnalyticsRangeParams {
  period?: AnalyticsPeriod;
  from?: string;
  to?: string;
}

function analyticsQuery(params?: AnalyticsRangeParams) {
  const { period, from, to } = params ?? { period: '30d' };
  if (from && to) return toQuery({ from, to });
  return toQuery({ period: period ?? '30d' });
}

export const analyticsApi = {
  creatorDashboard: (params?: AnalyticsRangeParams) =>
    apiFetch<{ kpis: { totalEarnings: number; pendingEarnings: number; campaignsCompleted: number; applicationSuccessRate: number } }>(
      `/analytics/creator/dashboard${analyticsQuery(params)}`,
    ),
  creatorEarnings: (params?: AnalyticsRangeParams) =>
    apiFetch<{
      monthlyEarningsTrend: { month: string; earnings: number }[];
      applicationFunnel: { status: string; count: number }[];
      categoryBreakdown: { name: string; count: number }[];
    }>(`/analytics/creator/earnings${analyticsQuery(params)}`),
  creatorProfilePerformance: (params?: AnalyticsRangeParams) =>
    apiFetch<{ metrics: { profileViews: number; invitationsReceived: number; messagesReceived: number; campaignOffers: number } }>(
      `/analytics/creator/profile-performance${analyticsQuery(params)}`,
    ),
  creatorTopBrands: (params?: AnalyticsRangeParams) =>
    apiFetch<{ topBrands: { brandId: string; brandName: string; campaignCount: number; earnings: number }[] }>(
      `/analytics/creator/top-brands${analyticsQuery(params)}`,
    ),

  adminDashboard: (params?: AnalyticsRangeParams) =>
    apiFetch<{ kpis: { totalCreators: number; totalBrands: number; platformRevenue: number; escrowVolume: number } }>(
      `/analytics/admin/dashboard${analyticsQuery(params)}`,
    ),
  adminUsers: (params?: AnalyticsRangeParams) =>
    apiFetch<{
      userGrowth: { month: string; creators: number; brands: number; total: number }[];
      growthMetrics: { newCreators: number; newBrands: number; creatorGrowthPercent: number; brandGrowthPercent: number };
    }>(`/analytics/admin/users${analyticsQuery(params)}`),
  adminRevenue: (params?: AnalyticsRangeParams) =>
    apiFetch<{
      revenueGrowth: { month: string; revenue: number }[];
      growthMetrics: { totalRevenue: number; revenueGrowthPercent: number };
    }>(`/analytics/admin/revenue${analyticsQuery(params)}`),
  adminCampaigns: (params?: AnalyticsRangeParams) =>
    apiFetch<{
      campaignAnalytics: { created: number; active: number; completed: number; flagged: number };
      campaignGrowth: { month: string; count: number }[];
      growthMetrics: { campaignGrowthPercent: number };
    }>(`/analytics/admin/campaigns${analyticsQuery(params)}`),
  adminKyc: (params?: AnalyticsRangeParams) =>
    apiFetch<{ kycAnalytics: { verified: number; pending: number; rejected: number } }>(
      `/analytics/admin/kyc${analyticsQuery(params)}`,
    ),
  adminPlatforms: (params?: AnalyticsRangeParams) =>
    apiFetch<{
      platformDistribution: { name: string; value: number; color: string }[];
      topCategories: { name: string; count: number; color: string }[];
    }>(`/analytics/admin/platforms${analyticsQuery(params)}`),
};

// ─── Security APIs (Brand & Creator) ───────────────────────────────────────
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorType?: string | null;
  phoneNumber?: string | null;
  lastPasswordChange?: string | null;
  activeSessionCount: number;
}

export interface TwoFactorStatus {
  enabled: boolean;
  type?: string | null;
  phoneNumber?: string | null;
  pendingEnrollment: boolean;
  firebaseMfaEnrolled?: boolean;
}

export interface UserSessionItem {
  id: string;
  deviceName?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
  location?: string | null;
  isActive: boolean;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
}

export interface SecurityActivityItem {
  id: string;
  type: string;
  label: string;
  device?: string | null;
  browser?: string | null;
  ipAddress?: string | null;
  location?: string | null;
  createdAt: string;
}

export const securityApi = {
  getSettings: () => apiFetch<SecuritySettings>('/security/settings'),
  get2FaStatus: () => apiFetch<TwoFactorStatus>('/security/2fa/status'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ message: string }>('/security/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  enable2Fa: (phoneNumber: string) =>
    apiFetch<{ enabled: boolean; pendingEnrollment: boolean; message: string }>('/security/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    }),
  confirm2Fa: () =>
    apiFetch<{ enabled: boolean; type?: string; phoneNumber?: string }>('/security/2fa/confirm', {
      method: 'POST',
      body: JSON.stringify({ firebaseMfaCompleted: true }),
    }),
  disable2Fa: () =>
    apiFetch<{ enabled: boolean; message: string }>('/security/2fa/disable', { method: 'POST' }),
  getSessions: () => apiFetch<UserSessionItem[]>('/security/sessions'),
  removeSession: (sessionId: string) =>
    apiFetch(`/security/sessions/${sessionId}`, { method: 'DELETE' }),
  signOutAll: (signOutCurrentDevice = false) =>
    apiFetch<{ signedOut: number; message: string }>('/security/signout-all', {
      method: 'POST',
      body: JSON.stringify({ signOutCurrentDevice }),
    }),
  getActivity: (params?: { page?: number; limit?: number }) =>
    apiFetch<{ data: SecurityActivityItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/security/activity${toQuery(params)}`,
    ),
};

// ─── Socket helper (local / dedicated WS host only) ───────────────────────────
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app';
}
