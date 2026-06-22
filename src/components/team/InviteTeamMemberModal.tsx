'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/src/components/ui/Modal';
import { organizationApi, type OrgType } from '@/src/lib/api';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  CAMPAIGN_MANAGER: 'Campaign Manager',
  FINANCE_MANAGER: 'Finance Manager',
  MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

interface InviteTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgType: OrgType;
  availableRoles: string[];
}

export default function InviteTeamMemberModal({
  open,
  onClose,
  onSuccess,
  orgType,
  availableRoles,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setRole('');
      setPermissions([]);
    }
  }, [open]);

  useEffect(() => {
    if (!role || !open) {
      setPermissions([]);
      return;
    }
    setLoadingPerms(true);
    organizationApi
      .getRolePermissions(orgType, role)
      .then((res) => setPermissions(res.permissions))
      .catch(() => setPermissions([]))
      .finally(() => setLoadingPerms(false));
  }, [role, orgType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !role) return;
    setLoading(true);
    try {
      const result = await organizationApi.inviteMember({ email: email.trim(), role });
      toast.success(result.emailSent ? `Invitation email sent to ${email.trim()}` : 'Invitation created');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
          >
            <option value="">Select a role...</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </select>
        </div>

        {role && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Permission Preview
            </p>
            {loadingPerms ? (
              <p className="text-sm text-slate-400">Loading permissions...</p>
            ) : permissions.length > 0 ? (
              <ul className="space-y-1.5">
                {permissions.map((perm) => (
                  <li key={perm} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">•</span>
                    {perm}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No permissions defined for this role.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !email.trim() || !role}
            className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
