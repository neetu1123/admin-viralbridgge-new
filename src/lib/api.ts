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

  createTestCampaign: () =>
    apiFetch('/admin/test-campaign', { method: 'POST' }),
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
  getWallet: () => apiFetch('/brand/wallet'),
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
  uploadPhoto: (url: string) =>
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
  withdraw: (amount: number) =>
    apiFetch('/creator/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }),
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

// ─── Socket helper (local / dedicated WS host only) ───────────────────────────
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app';
}
