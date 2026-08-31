'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { User, Bell, CreditCard, Shield, ChevronRight, Save, ShieldCheck, Users, Loader2 } from 'lucide-react';
import Icon from '@/src/components/ui/AppIcon';
import KycVerificationPanel from '@/src/components/KycVerificationPanel';
import TeamMembersPanel from '@/src/components/team/TeamMembersPanel';
import AcceptInvitationBanner from '@/src/components/team/AcceptInvitationBanner';
import SecuritySettingsPanel from '@/src/components/security/SecuritySettingsPanel';
import NotificationToggle from '@/src/components/ui/NotificationToggle';
import RequestCloseAccountPanel from '@/src/components/settings/RequestCloseAccountPanel';
import { creatorApi } from '@/src/lib/api';


type SettingsTab = 'account' | 'verification' | 'notifications' | 'payouts' | 'team' | 'security';

function tabFromPathname(pathname: string): SettingsTab {
  const segment = pathname.split('/').pop();
  const valid: SettingsTab[] = ['account', 'verification', 'notifications', 'payouts', 'team', 'security'];
  return valid.includes(segment as SettingsTab) ? (segment as SettingsTab) : 'account';
}

export default function CreatorSettingsContent() {
  const pathname = usePathname();
  const activeTab = tabFromPathname(pathname);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');
  const [notifCampaigns, setNotifCampaigns] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifInvites, setNotifInvites] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, settings] = await Promise.all([
        creatorApi.getProfile() as Promise<Record<string, unknown>>,
        creatorApi.getSettings() as Promise<Record<string, unknown>>,
      ]);
      const user = (profile.user as Record<string, unknown>) ?? {};
      setDisplayName(String(profile.full_name ?? user.name ?? ''));
      setEmail(String(user.email ?? profile.contact_email ?? ''));
      setLanguage(String(settings.language ?? 'English'));
      setTimezone(String(settings.timezone ?? 'IST (UTC+5:30)'));
      setNotifCampaigns(settings.notifCampaigns !== false);
      setNotifPayments(settings.notifPayments !== false);
      setNotifMessages(settings.notifMessages !== false);
      setNotifInvites(settings.notifInvites !== false);
      setNotifWeekly(Boolean(settings.notifWeekly));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveAccount = async () => {
    setSaving(true);
    try {
      await creatorApi.updateProfile({
        full_name: displayName,
        contact_email: email,
      });
      await creatorApi.updateSettings({ language, timezone });
      toast.success('Account settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await creatorApi.updateSettings({
        notifCampaigns,
        notifPayments,
        notifMessages,
        notifInvites,
        notifWeekly,
      });
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payouts', label: 'Payout Settings', icon: CreditCard },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, notifications, payout preferences, and security</p>
      </div>

      <AcceptInvitationBanner />

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="animate-spin text-violet-600" size={28} />
        </div>
      ) : (
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const href = `/creator-settings/${tab.id}`;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-slate-50 last:border-0 ${isActive ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-violet-600' : 'text-slate-400'} />
                    {tab.label}
                  </div>
                  <ChevronRight size={13} className={isActive ? 'text-violet-400' : 'text-slate-300'} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'account' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Account Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Display Name</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>Hindi</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white">
                      <option>EST (UTC-5)</option>
                      <option>PST (UTC-8)</option>
                      <option>IST (UTC+5:30)</option>
                      <option>GMT (UTC+0)</option>
                      <option>CET (UTC+1)</option>
                    </select>
                  </div>
                </div>
                <RequestCloseAccountPanel roleLabel="Creator" />
                <button onClick={saveAccount} disabled={saving} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'verification' && <KycVerificationPanel role="creator" />}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Campaign Updates', desc: 'Application status changes, approvals, and rejections', value: notifCampaigns, setter: setNotifCampaigns },
                  { label: 'Payment Notifications', desc: 'Escrow locks, releases, and withdrawal confirmations', value: notifPayments, setter: setNotifPayments },
                  { label: 'New Messages', desc: 'When brands send you messages', value: notifMessages, setter: setNotifMessages },
                  { label: 'Campaign Invites', desc: 'When brands invite you to apply to their campaigns', value: notifInvites, setter: setNotifInvites },
                  { label: 'Weekly Performance Report', desc: 'Summary of your earnings and campaign performance', value: notifWeekly, setter: setNotifWeekly },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <NotificationToggle
                      checked={item.value}
                      label={item.label}
                      onChange={(next) => item.setter(next)}
                    />
                  </div>
                ))}
                <button onClick={saveNotifications} disabled={saving} className="mt-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50">
                  <Save size={14} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Payout Settings</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Connected Payout Methods</p>
                  <div className="space-y-3">
                    {[
                      { method: 'PayPal', account: 'sofia@Viralbridgge.io', primary: true },
                      { method: 'Bank Transfer', account: '****4821 (Chase)', primary: false },
                    ].map(pm => (
                      <div key={pm.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                            <CreditCard size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{pm.method}</p>
                            <p className="text-xs text-slate-400">{pm.account}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pm.primary && <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Primary</span>}
                          <button onClick={() => toast.success('Updated')} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => toast.success('Add payout method')} className="mt-3 text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                    + Add Payout Method
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payout Preferences</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Minimum Payout Threshold</label>
                      <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                        <option>₹50</option>
                        <option>₹100</option>
                        <option>₹250</option>
                        <option>₹500</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Auto-Payout</label>
                      <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white">
                        <option>Manual (request each time)</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.success('Payout settings saved')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
                  <Save size={14} /> Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && <TeamMembersPanel orgType="CREATOR" />}

          {activeTab === 'security' && <SecuritySettingsPanel />}
        </div>
      </div>
      )}
    </div>
  );
}
