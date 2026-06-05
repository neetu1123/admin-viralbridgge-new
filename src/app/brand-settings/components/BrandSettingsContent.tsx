'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { brandApi } from '@/src/lib/api';
import { Building2, Bell, CreditCard, Shield, Users, ChevronRight, Save } from 'lucide-react';
import Icon from '@/src/components/ui/AppIcon';


type SettingsTab = 'profile' | 'notifications' | 'billing' | 'team' | 'security';

export default function BrandSettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [bio, setBio] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profile = (await brandApi.getProfile()) as Record<string, unknown>;
      setBrandName(String(profile.company_name ?? ''));
      setWebsite(String(profile.website ?? ''));
      setIndustry(String(profile.industry ?? ''));
      setBio(String(profile.description ?? ''));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load brand profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await brandApi.updateProfile({
        companyName: brandName,
        website,
        industry,
        description: bio,
      });
      toast.success('Brand profile saved!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  const [notifApplicants, setNotifApplicants] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMilestones, setNotifMilestones] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Brand Profile', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your brand profile, notifications, billing, and team</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-slate-50 last:border-0 ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={activeTab === tab.id ? 'text-violet-600' : 'text-slate-400'} />
                    {tab.label}
                  </div>
                  <ChevronRight size={13} className={activeTab === tab.id ? 'text-violet-400' : 'text-slate-300'} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Brand Profile</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-700 text-xl font-bold">NK</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">Brand Logo</p>
                    <button onClick={() => toast.success('Upload triggered')} className="text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">Upload Logo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand Name</label>
                    <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white">
                      <option>Technology</option>
                      <option>Beauty & Skincare</option>
                      <option>Fashion & Style</option>
                      <option>Fitness & Wellness</option>
                      <option>Food & Beverage</option>
                      <option>Travel & Hospitality</option>
                      <option>Finance</option>
                      <option>Gaming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Email</label>
                    <input type="email" defaultValue="brand@novaspark.co" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Brand Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 resize-none" />
                </div>
                <button onClick={saveProfile} disabled={saving || loading} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all disabled:opacity-70">
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'New Applicants', desc: 'Get notified when creators apply to your campaigns', value: notifApplicants, setter: setNotifApplicants },
                  { label: 'Payment Updates', desc: 'Escrow locks, releases, and payment confirmations', value: notifPayments, setter: setNotifPayments },
                  { label: 'New Messages', desc: 'When creators send you messages', value: notifMessages, setter: setNotifMessages },
                  { label: 'Campaign Milestones', desc: 'View count milestones and performance alerts', value: notifMilestones, setter: setNotifMilestones },
                  { label: 'Weekly Report', desc: 'Summary of campaign performance every Monday', value: notifWeeklyReport, setter: setNotifWeeklyReport },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => { item.setter(!item.value); toast.success(`${item.label} notifications ${!item.value ? 'enabled' : 'disabled'}`); }}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${item.value ? 'bg-violet-600' : 'bg-slate-200'}`}
                      style={{ height: '22px', width: '40px' }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Billing & Payments</h2>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment Method</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-blue-600 rounded-md flex items-center justify-center"><span className="text-white text-xs font-bold">VISA</span></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Visa ending in 4821</p>
                        <p className="text-xs text-slate-400">Expires 09/2028</p>
                      </div>
                    </div>
                    <button onClick={() => toast.success('Update payment method')} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Update</button>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Billing Summary</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Total Spent (All Time)', value: '₹41,700' },
                      { label: 'Platform Fee (5%)', value: '₹2,085' },
                      { label: 'Active Escrow', value: '₹22,100' },
                      { label: 'Available Balance', value: '₹8,300' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => toast.success('Invoice downloaded')} className="text-sm text-violet-600 hover:text-violet-700 font-medium">Download Invoice →</button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-800">Team Members</h2>
                <button onClick={() => toast.success('Invite sent')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all">
                  <Users size={14} /> Invite Member
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Kavya Reddy', email: 'kavya@novaspark.co', role: 'Owner', avatar: 'KR' },
                  { name: 'Ravi Sharma', email: 'ravi@novaspark.co', role: 'Campaign Manager', avatar: 'RS' },
                  { name: 'Lena Fischer', email: 'lena@novaspark.co', role: 'Finance', avatar: 'LF' },
                ].map(member => (
                  <div key={member.email} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-700 text-xs font-bold">{member.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{member.role}</span>
                      {member.role !== 'Owner' && <button onClick={() => toast.error('Member removed')} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5">Security Settings</h2>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Change Password</p>
                      <p className="text-xs text-slate-400 mt-0.5">Last changed 3 months ago</p>
                    </div>
                    <button onClick={() => toast.success('Password reset email sent')} className="text-xs text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">Update</button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</p>
                    </div>
                    <button onClick={() => toast.success('2FA setup initiated')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">Enable 2FA</button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Active Sessions</p>
                      <p className="text-xs text-slate-400 mt-0.5">2 active sessions</p>
                    </div>
                    <button onClick={() => toast.warning('All other sessions signed out')} className="text-xs text-red-600 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Sign Out All</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
