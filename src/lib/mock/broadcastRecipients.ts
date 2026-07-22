export type UserStatusFilter = 'all' | 'active' | 'inactive' | 'verified' | 'premium';

export interface MockBroadcastRecipient {
  id: string;
  name: string;
  email: string;
  role: 'Creator' | 'Brand' | 'Admin';
  status: 'Active' | 'Inactive' | 'Verified' | 'Premium';
  lastActive: string;
  location: string;
}

export const USER_STATUS_OPTIONS: { id: UserStatusFilter; label: string }[] = [
  { id: 'all', label: 'All Users' },
  { id: 'active', label: 'Active Users' },
  { id: 'inactive', label: 'Inactive Users' },
  { id: 'verified', label: 'Verified Users' },
  { id: 'premium', label: 'Premium Users' },
];

export const MOCK_BROADCAST_RECIPIENTS: MockBroadcastRecipient[] = [
  { id: 'u1', name: 'Sofia Martinez', email: 'sofia@example.com', role: 'Creator', status: 'Active', lastActive: '2026-07-21', location: 'Los Angeles' },
  { id: 'u2', name: 'Priya Nair', email: 'priya@example.com', role: 'Creator', status: 'Verified', lastActive: '2026-07-20', location: 'Mumbai' },
  { id: 'u3', name: 'James Okoro', email: 'james@example.com', role: 'Creator', status: 'Inactive', lastActive: '2026-05-02', location: 'London' },
  { id: 'u4', name: 'NovaSpark Beauty', email: 'brand@novaspark.co', role: 'Brand', status: 'Premium', lastActive: '2026-07-19', location: 'New York' },
  { id: 'u5', name: 'Mei-Lin Chen', email: 'meilin@example.com', role: 'Creator', status: 'Inactive', lastActive: '2026-04-15', location: 'Singapore' },
  { id: 'u6', name: 'Pulse Gadgets', email: 'hello@pulse.io', role: 'Brand', status: 'Active', lastActive: '2026-07-18', location: 'San Francisco' },
  { id: 'u7', name: 'Aisha Okonkwo', email: 'aisha@example.com', role: 'Creator', status: 'Verified', lastActive: '2026-07-17', location: 'Lagos' },
  { id: 'u8', name: 'Daniela Rossi', email: 'daniela@example.com', role: 'Creator', status: 'Inactive', lastActive: '2026-03-28', location: 'Barcelona' },
  { id: 'u9', name: 'Admin User', email: 'admin@gmail.com', role: 'Admin', status: 'Active', lastActive: '2026-07-21', location: 'Remote' },
  { id: 'u10', name: 'Yuki Tanaka', email: 'yuki@example.com', role: 'Creator', status: 'Premium', lastActive: '2026-07-16', location: 'Tokyo' },
];

export function filterRecipientsByStatus(
  recipients: MockBroadcastRecipient[],
  statusFilter: UserStatusFilter,
  search: string,
): MockBroadcastRecipient[] {
  let filtered = recipients;

  if (statusFilter === 'active') {
    filtered = filtered.filter((r) => r.status === 'Active');
  } else if (statusFilter === 'inactive') {
    filtered = filtered.filter((r) => r.status === 'Inactive');
  } else if (statusFilter === 'verified') {
    filtered = filtered.filter((r) => r.status === 'Verified');
  } else if (statusFilter === 'premium') {
    filtered = filtered.filter((r) => r.status === 'Premium');
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q),
    );
  }

  return filtered;
}
