'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Shield, Smartphone, Monitor, Lock, Eye, EyeOff } from 'lucide-react';
import Modal from '@/src/components/ui/Modal';
import {
  securityApi,
  type SecurityActivityItem,
  type SecuritySettings,
  type TwoFactorStatus,
  type UserSessionItem,
} from '@/src/lib/api';

function formatRelative(iso?: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function SecuritySettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [twoFa, setTwoFa] = useState<TwoFactorStatus | null>(null);
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [activity, setActivity] = useState<SecurityActivityItem[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, twoFaRes, sessionsRes, activityRes] = await Promise.all([
        securityApi.getSettings(),
        securityApi.get2FaStatus(),
        securityApi.getSessions(),
        securityApi.getActivity({ page: 1, limit: 10 }),
      ]);
      setSettings(settingsRes);
      setTwoFa(twoFaRes);
      setSessions(sessionsRes);
      setActivity(activityRes.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) return toast.error('Enter your current password');
    if (newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (currentPassword === newPassword) return toast.error('New password must be different from current password');

    setActionLoading('password');
    try {
      const res = await securityApi.changePassword(currentPassword, newPassword);
      toast.success(res.message || 'Password changed successfully');
      setPasswordModalOpen(false);
      resetPasswordForm();
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnable2Fa = async () => {
    if (!phoneNumber.trim()) return toast.error('Enter a phone number');
    setActionLoading('2fa-enable');
    try {
      const res = await securityApi.enable2Fa(phoneNumber.trim());
      toast.success(res.message);
      if (res.pendingEnrollment) {
        toast.info('Complete MFA in Firebase, then click Confirm 2FA');
      }
      setTwoFaModalOpen(false);
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable 2FA');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm2Fa = async () => {
    setActionLoading('2fa-confirm');
    try {
      await securityApi.confirm2Fa();
      toast.success('Two-factor authentication confirmed');
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm 2FA');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisable2Fa = async () => {
    if (!confirm('Disable two-factor authentication?')) return;
    setActionLoading('2fa-disable');
    try {
      const res = await securityApi.disable2Fa();
      toast.success(res.message);
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveSession = async (session: UserSessionItem) => {
    if (session.isCurrent) return toast.error('Cannot remove current session');
    if (!confirm('Remove this session?')) return;
    setActionLoading(session.id);
    try {
      await securityApi.removeSession(session.id);
      toast.success('Session removed');
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOutAll = async () => {
    setActionLoading('signout-all');
    try {
      const res = await securityApi.signOutAll(false);
      toast.success(res.message);
      setSignOutModalOpen(false);
      loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign out devices');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Security Settings</h2>
        <div className="space-y-4">
          {/* Change Password */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Change Password</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last changed {formatRelative(settings?.lastPasswordChange)}
                </p>
              </div>
              <button
                onClick={() => {
                  resetPasswordForm();
                  setPasswordModalOpen(true);
                }}
                disabled={actionLoading === 'password'}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors disabled:opacity-50"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {twoFa?.enabled
                    ? `Enabled${twoFa.phoneNumber ? ` · ${twoFa.phoneNumber}` : ''}`
                    : twoFa?.pendingEnrollment
                      ? 'Pending enrollment — confirm after Firebase MFA setup'
                      : 'Not enabled — add extra security'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {twoFa?.pendingEnrollment && !twoFa.enabled && (
                  <button
                    onClick={handleConfirm2Fa}
                    disabled={actionLoading === '2fa-confirm'}
                    className="text-xs text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 font-medium"
                  >
                    Confirm 2FA
                  </button>
                )}
                {twoFa?.enabled ? (
                  <button
                    onClick={handleDisable2Fa}
                    disabled={actionLoading === '2fa-disable'}
                    className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button
                    onClick={() => setTwoFaModalOpen(true)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Active Sessions</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {settings?.activeSessionCount ?? sessions.length} active session(s)
                </p>
              </div>
              <button
                onClick={() => setSignOutModalOpen(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sign Out All
              </button>
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-400">No active sessions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Monitor size={14} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {session.deviceName ?? 'Device'} · {session.browser ?? 'Browser'}
                          {session.isCurrent && (
                            <span className="ml-2 text-xs text-emerald-600 font-semibold">Current</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {session.location ?? 'Unknown'} · Last active {formatLastActive(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRemoveSession(session)}
                        disabled={actionLoading === session.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Activity */}
          <div className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">Recent Security Activity</p>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-400">No security activity yet.</p>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Shield size={13} className="text-violet-500" />
                      <div>
                        <p className="text-sm text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">
                          {[item.device, item.browser].filter(Boolean).join(' · ') || 'Unknown device'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{formatLastActive(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          resetPasswordForm();
        }}
        title="Change Password"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter your current password, then choose a new password (minimum 8 characters).
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setPasswordModalOpen(false);
                resetPasswordForm();
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={actionLoading === 'password'}
              className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50"
            >
              {actionLoading === 'password' ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={twoFaModalOpen} onClose={() => setTwoFaModalOpen(false)} title="Enable Two-Factor Authentication" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter your phone number for SMS-based two-factor authentication via Firebase MFA.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
            <div className="relative">
              <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setTwoFaModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleEnable2Fa}
              disabled={actionLoading === '2fa-enable'}
              className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
            >
              {actionLoading === '2fa-enable' ? 'Enabling...' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} title="Sign Out All Devices" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure? This will sign out all other devices. Your current session will stay active.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setSignOutModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSignOutAll}
              disabled={actionLoading === 'signout-all'}
              className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
            >
              {actionLoading === 'signout-all' ? 'Signing out...' : 'Sign Out All'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
