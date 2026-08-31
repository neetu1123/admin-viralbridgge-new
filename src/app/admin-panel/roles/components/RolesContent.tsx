'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Shield, UserPlus, Users, Activity, ShieldCheck, Award } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { rolesApi, adminApi } from '@/src/lib/api';

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface Role {
  id: string;
  name: string;
  description: string;
  _count?: { users: number };
  permissions?: Array<{ permission: { id: string; key: string; description?: string } }>;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: { name: string };
  status: string;
}

// ─── Modals ─────────────────────────────────────────────────────────────────
function RoleModal({ 
  role, 
  onClose, 
  onSave 
}: { 
  role?: Role | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Role name is required');
    setLoading(true);
    try {
      if (role) {
        await rolesApi.updateRole(role.id, { name, description });
        toast.success('Role updated successfully');
      } else {
        await rolesApi.createRole({ name, description });
        toast.success('Role created successfully');
      }
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">{role ? 'Edit Role' : 'Create New Role'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Name</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Content Moderator"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the responsibilities of this role..." rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none"
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignAdminModal({ 
  roles, 
  onClose, 
  onSave 
}: { 
  roles: Role[]; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !roleId) return toast.error('Email and Role are required');
    if (isNewUser && !password.trim()) return toast.error('Password is required to create a new user');
    
    setLoading(true);
    try {
      await rolesApi.assignAdminRole({
        email: email.trim(),
        role_id: roleId,
        ...(isNewUser ? { name: name.trim(), password } : {})
      });
      toast.success(isNewUser ? 'New Admin user created & role assigned!' : 'Admin role assigned successfully');
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">Assign Admin Role</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X size={18} /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Assign an administrative role to an existing user, or create a brand new user account directly.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">User Email</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input 
              type="checkbox" 
              id="isNewUser" 
              checked={isNewUser} 
              onChange={e => setIsNewUser(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500 cursor-pointer"
            />
            <label htmlFor="isNewUser" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
              Create a new user account if it doesn't exist
            </label>
          </div>

          {isNewUser && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name (Optional)</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <select 
              value={roleId} onChange={e => setRoleId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
            >
              <option value="">Select a role...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
              {loading ? 'Processing...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionsModal({
  role,
  onClose,
  onSave,
}: {
  role: Role;
  onClose: () => void;
  onSave: () => void;
}) {
  const [allPermissions, setAllPermissions] = useState<Array<{ id: string; key: string; description?: string }>>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [perms, rolePerms] = await Promise.all([
          rolesApi.getPermissions(),
          rolesApi.getRolePermissions(role.id),
        ]);
        setAllPermissions(perms);
        setSelected(new Set(rolePerms.permissions.map((p) => p.key)));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to load permissions');
      } finally {
        setLoading(false);
      }
    })();
  }, [role.id]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rolesApi.updateRolePermissions(role.id, Array.from(selected));
      toast.success('Permissions updated');
      onSave();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Permissions — {role.name}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading permissions…</p>
        ) : (
          <div className="space-y-2 mb-6">
            {allPermissions.map((perm) => (
              <label key={perm.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(perm.key)}
                  onChange={() => toggle(perm.key)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{perm.key}</p>
                  {perm.description && <p className="text-xs text-slate-500">{perm.description}</p>}
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, adminsRes] = await Promise.all([
        rolesApi.getRoles(),
        rolesApi.getAdmins(),
      ]);
      setRoles(rolesRes);
      setAdmins(adminsRes);
    } catch (err: any) {
      toast.error('Failed to load roles: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    try {
      await rolesApi.deleteRole(id);
      toast.success('Role deleted successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  const handleRemoveAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${userName}?`)) return;
    try {
      // We can use the existing adminApi to update user role to null/empty
      await adminApi.updateUserRole(userId, '');
      toast.success('Admin removed successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove admin');
    }
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      
      {isRoleModalOpen && (
        <RoleModal 
          role={editingRole} 
          onClose={() => setIsRoleModalOpen(false)} 
          onSave={() => { setIsRoleModalOpen(false); loadData(); }} 
        />
      )}

      {isAssignModalOpen && (
        <AssignAdminModal 
          roles={roles} 
          onClose={() => setIsAssignModalOpen(false)} 
          onSave={() => { setIsAssignModalOpen(false); loadData(); }} 
        />
      )}

      {permissionsRole && (
        <PermissionsModal
          role={permissionsRole}
          onClose={() => setPermissionsRole(null)}
          onSave={() => { setPermissionsRole(null); loadData(); }}
        />
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield size={22} className="text-violet-600" /> Admin Roles & Access
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage role-based access control and assign administrative privileges</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openCreateRole} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> Create Role
          </button>
          <button onClick={() => setIsAssignModalOpen(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <UserPlus size={16} /> Assign Admin
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* ─── KPIs ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Admins</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{admins.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                <Users size={20} />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active Admins</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {admins.filter(a => a.status === 'ACTIVE').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Configured Roles</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{roles.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Most Assigned Role</p>
                <h3 className="text-lg font-bold text-slate-800 truncate max-w-[120px]">
                  {roles.length > 0 
                    ? [...roles].sort((a, b) => (b._count?.users || 0) - (a._count?.users || 0))[0]?.name 
                    : 'N/A'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Award size={20} />
              </div>
            </div>
          </div>

          {/* ─── Roles Grid ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {roles.map(role => (
              <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Shield size={16} className="text-violet-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{role.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditRole(role)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDeleteRole(role.id, role.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 min-h-[40px] leading-relaxed line-clamp-2">
                  {role.description || 'No description provided.'}
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {role.permissions?.length ?? 0} permissions
                  </span>
                  {!['SUPER_ADMIN', 'ADMIN'].includes(role.name) && (
                    <button
                      onClick={() => setPermissionsRole(role)}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Manage
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assigned Users</span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {role._count?.users || 0}
                  </span>
                </div>
              </div>
            ))}
            {roles.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                <Shield size={32} className="mx-auto text-slate-400 mb-3 opacity-50" />
                <h3 className="text-sm font-bold text-slate-700 mb-1">No roles found</h3>
                <p className="text-xs text-slate-500 mb-4">Create your first role to start assigning permissions.</p>
                <button onClick={openCreateRole} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50">
                  <Plus size={14} /> Create Role
                </button>
              </div>
            )}
          </div>

          {/* ─── Admins Table ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Admin Members</h2>
              <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{admins.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              {admins.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No admins assigned yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Admin User</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Assigned Role</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map(member => (
                      <tr key={member.id} className="hover:bg-violet-50/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white text-xs font-bold">{member.name?.slice(0, 2)?.toUpperCase() || '?'}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">{member.name || 'Unnamed'}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200 px-2.5 py-1 rounded-full shadow-sm">
                            <Shield size={12} /> {member.role?.name || 'Unknown Role'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {member.status === 'ACTIVE' ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Active
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500">{member.status}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleRemoveAdmin(member.id, member.name)} className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors">
                              <Trash2 size={14} /> Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
