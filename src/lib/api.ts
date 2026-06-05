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
    throw new Error('Cannot reach API. Check CORS_ORIGINS on the backend includes your frontend URL.');
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
    window.location.href = '/sign-up-login-screen';
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
      is_verified: boolean; created_at: string; role?: { name: string };
    }>>('/admin/users'),

  getUser: (id: string) => apiFetch(`/admin/users/${id}`),

  banUser: (id: string) => apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH' }),

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
  getNotifications: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/brand/notifications${toQuery(params)}`),
  markNotificationRead: (id: string) => apiFetch(`/brand/notifications/${id}/read`, { method: 'PATCH' }),
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
  getNotifications: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/creator/notifications${toQuery(params)}`),
  markNotificationRead: (id: string) => apiFetch(`/creator/notifications/${id}/read`, { method: 'PATCH' }),
  getSettings: () => apiFetch('/creator/settings'),
  updateSettings: (data: Record<string, unknown>) =>
    apiFetch('/creator/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Socket helper (local / dedicated WS host only) ───────────────────────────
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'https://backend-admin-viralbridgge-new-three.vercel.app';
}
