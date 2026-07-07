'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { Loader2, Mail, Send, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi, type NotificationItem } from '@/src/lib/api';

type Tab = 'inbox' | 'broadcast';

export default function AdminNotificationsContent() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<{
    configured: boolean;
    fromEmail: string;
    hint: string;
  } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [broadcast, setBroadcast] = useState({
    subject: '',
    title: '',
    message: '',
    audience: 'all' as 'all' | 'creators' | 'brands' | 'admins',
    sendInApp: true,
    ctaLabel: '',
    ctaUrl: '',
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, status] = await Promise.all([
        adminApi.getNotifications({ limit: 50 }),
        adminApi.getEmailStatus(),
      ]);
      setItems(res.data);
      setEmailStatus(status);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setSendingTest(true);
    try {
      await adminApi.sendTestEmail(testEmail.trim());
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Test email failed');
    } finally {
      setSendingTest(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcast.subject.trim() || !broadcast.title.trim() || !broadcast.message.trim()) {
      toast.error('Subject, title, and message are required');
      return;
    }
    if (!confirm(`Send broadcast to "${broadcast.audience}" users? This sends real emails.`)) return;

    setSendingBroadcast(true);
    try {
      const result = await adminApi.sendBroadcast({
        subject: broadcast.subject.trim(),
        title: broadcast.title.trim(),
        message: broadcast.message.trim(),
        audience: broadcast.audience,
        sendInApp: broadcast.sendInApp,
        ctaLabel: broadcast.ctaLabel.trim() || undefined,
        ctaUrl: broadcast.ctaUrl.trim() || undefined,
      });
      toast.success(`Broadcast sent: ${result.sent} emails, ${result.inApp} in-app (${result.failed} failed)`);
      if (result.errors?.length) {
        console.warn('Broadcast errors:', result.errors);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications & Email</h1>
          <p className="text-slate-500 text-sm mt-1">In-app alerts and broadcast emails to users</p>
        </div>
        {tab === 'inbox' && (
          <button onClick={markAllRead} className="text-xs font-medium text-violet-600 hover:text-violet-800 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50">
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {([
          { id: 'inbox' as const, label: 'In-app Inbox', icon: Bell },
          { id: 'broadcast' as const, label: 'Broadcast Email', icon: Mail },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === id ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {emailStatus && (
        <div className={`mb-6 rounded-xl border p-4 flex items-start gap-3 ${emailStatus.configured ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          {emailStatus.configured ? (
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${emailStatus.configured ? 'text-emerald-800' : 'text-amber-800'}`}>
              Email service: {emailStatus.configured ? 'Connected (Resend)' : 'Not configured'}
            </p>
            <p className="text-xs mt-1 text-slate-600 leading-relaxed">
              {emailStatus.configured
                ? `Sending from ${emailStatus.fromEmail}. Team invites, OTPs, and broadcasts use this.`
                : emailStatus.hint}
            </p>
          </div>
        </div>
      )}

      {tab === 'inbox' && (
        loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-violet-600" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map(n => (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${n.is_read ? 'border-slate-200 opacity-70' : 'border-violet-200 hover:bg-violet-50/30'}`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-violet-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.type} · {n.created_at?.slice(0, 16).replace('T', ' ')}</p>
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {tab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Send size={16} className="text-violet-600" />
              Send Broadcast
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Audience</label>
              <select
                value={broadcast.audience}
                onChange={e => setBroadcast(b => ({ ...b, audience: e.target.value as typeof b.audience }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="all">All Creators & Brands</option>
                <option value="brands">Brands only</option>
                <option value="creators">Creators only</option>
                <option value="admins">Admins only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email subject</label>
              <input
                value={broadcast.subject}
                onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))}
                placeholder="Important platform update"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title (in email body)</label>
              <input
                value={broadcast.title}
                onChange={e => setBroadcast(b => ({ ...b, title: e.target.value }))}
                placeholder="We have exciting news"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
              <textarea
                value={broadcast.message}
                onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                rows={5}
                placeholder="Write your announcement here..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={broadcast.sendInApp}
                onChange={e => setBroadcast(b => ({ ...b, sendInApp: e.target.checked }))}
              />
              Also send as in-app notification
            </label>
            <button
              onClick={handleBroadcast}
              disabled={sendingBroadcast || !emailStatus?.configured}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm"
            >
              {sendingBroadcast ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sendingBroadcast ? 'Sending…' : 'Send Broadcast'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-800">Test email setup</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Emails are sent via <strong>Resend</strong>. If invites or broadcasts fail, add these to your backend (Vercel) environment and redeploy:
            </p>
            <ul className="text-xs text-slate-600 space-y-1 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
              <li>RESEND_API_KEY=re_xxxxx</li>
              <li>RESEND_FROM_EMAIL=Your Name &lt;you@yourdomain.com&gt;</li>
              <li>APP_URL=https://your-frontend.vercel.app</li>
            </ul>
            <p className="text-xs text-slate-500">
              Verify your sending domain at{' '}
              <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-violet-600 underline">
                resend.com/domains
              </a>
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Send test to</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={sendingTest || !emailStatus?.configured}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
                >
                  {sendingTest ? '…' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
