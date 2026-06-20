'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, UserPlus, Users, X } from 'lucide-react';
import {
  organizationApi,
  type OrgType,
  type PendingInvitation,
  type TeamMember,
  type TeamResponse,
} from '@/src/lib/api';
import { initials } from '@/src/lib/mappers';
import StatusBadge from '@/src/components/ui/StatusBadge';
import InviteTeamMemberModal from './InviteTeamMemberModal';

function formatLastActive(iso?: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  CAMPAIGN_MANAGER: 'Campaign Manager',
  FINANCE_MANAGER: 'Finance Manager',
  MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

interface TeamMembersPanelProps {
  orgType: OrgType;
}

export default function TeamMembersPanel({ orgType }: TeamMembersPanelProps) {
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'members' | 'pending'>('members');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizationApi.getTeam();
      setTeam(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleRemove = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    setActionId(member.id);
    try {
      await organizationApi.removeMember(member.id);
      toast.success('Member removed');
      loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setActionId(null);
    }
  };

  const handleRoleChange = async (memberId: string) => {
    if (!editRole) return;
    setActionId(memberId);
    try {
      await organizationApi.changeMemberRole(memberId, editRole);
      toast.success('Role updated');
      setEditingMemberId(null);
      loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setActionId(null);
    }
  };

  const handleReinvite = async (inv: PendingInvitation) => {
    setActionId(inv.id);
    try {
      await organizationApi.reinvite(inv.id);
      toast.success('Invitation resent');
      loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend invitation');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (inv: PendingInvitation) => {
    if (!confirm(`Cancel invitation for ${inv.email}?`)) return;
    setActionId(inv.id);
    try {
      await organizationApi.cancelInvitation(inv.id);
      toast.success('Invitation cancelled');
      loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invitation');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  const canManage = team?.canManageTeam ?? false;
  const members = team?.activeMembers ?? [];
  const pending = team?.pendingInvitations ?? [];
  const availableRoles = team?.availableRoles ?? [];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Team Members</h2>
            {team?.organizationName && (
              <p className="text-xs text-slate-400 mt-0.5">{team.organizationName}</p>
            )}
          </div>
          {canManage && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all"
            >
              <UserPlus size={14} /> Invite Member
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 mb-5 bg-slate-100 rounded-xl p-1">
          {([
            { id: 'members' as const, label: 'Active Members', count: members.length },
            { id: 'pending' as const, label: 'Pending Invitations', count: pending.length },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                section === tab.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {section === 'members' && (
          <div className="overflow-x-auto">
            {members.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active team members yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Member</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Last Active</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    {canManage && <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {member.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-violet-700 text-xs font-bold">{initials(member.name)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        {editingMemberId === member.id && canManage && !member.isOwner ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white"
                            >
                              {availableRoles.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r] ?? r}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRoleChange(member.id)}
                              disabled={actionId === member.id}
                              className="text-xs text-violet-600 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMemberId(null)}
                              className="text-xs text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                            {member.roleLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">{formatLastActive(member.lastActiveAt)}</td>
                      <td className="py-3">
                        <StatusBadge status={member.status === 'ACTIVE' ? 'active' : 'archived'} />
                      </td>
                      {canManage && (
                        <td className="py-3 text-right">
                          {!member.isOwner && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingMemberId(member.id);
                                  setEditRole(member.role);
                                }}
                                disabled={actionId === member.id}
                                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                              >
                                Edit Role
                              </button>
                              <button
                                onClick={() => handleRemove(member)}
                                disabled={actionId === member.id}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {section === 'pending' && (
          <div className="overflow-x-auto">
            {pending.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Mail size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending invitations.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Email</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Invited By</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Expires</th>
                    <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    {canManage && <th className="pb-3 font-semibold text-slate-500 text-xs uppercase tracking-wide text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 font-medium text-slate-800">{inv.email}</td>
                      <td className="py-3">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                          {inv.roleLabel}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-xs">{inv.invitedBy}</td>
                      <td className="py-3 text-slate-500 text-xs">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <StatusBadge status="pending" />
                      </td>
                      {canManage && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReinvite(inv)}
                              disabled={actionId === inv.id}
                              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
                            >
                              <RefreshCw size={12} /> Resend
                            </button>
                            <button
                              onClick={() => handleCancel(inv)}
                              disabled={actionId === inv.id}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <InviteTeamMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          toast.success('Invitation sent');
          loadTeam();
          setSection('pending');
        }}
        orgType={orgType}
        availableRoles={availableRoles}
      />
    </>
  );
}
