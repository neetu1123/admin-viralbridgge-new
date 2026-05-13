'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Bell, Briefcase, DollarSign, MessageSquare, Star, AlertCircle, X, Check } from 'lucide-react';
import Icon from '@/src/components/ui/AppIcon';


interface Notification {
  id: string; type: 'campaign' | 'payment' | 'message' | 'invite' | 'alert';
  title: string; description: string; time: string; read: boolean; urgent?: boolean;
  actionLabel?: string; actionHref?: string;
}

const initialNotifications: Notification[] = [
  { id: 'cn-001', type: 'invite', title: 'Campaign invite — NovaSpark Co.', description: 'NovaSpark Co. has invited you to apply to their Fall Collection campaign. Budget: ₹1,800 per creator. Deadline: May 10.', time: '5 min ago', read: false, urgent: false, actionLabel: 'View Campaign', actionHref: '/campaign-discovery' },
  { id: 'cn-002', type: 'payment', title: 'Payment released — ₹1,200', description: '₹1,200 has been released from escrow for completing the Summer Glow Skincare Launch deliverables. Funds are now in your wallet.', time: '1 hr ago', read: false, actionLabel: 'View Wallet', actionHref: '/wallet-payments' },
  { id: 'cn-003', type: 'campaign', title: 'Application approved — FitPro Challenge', description: 'Congratulations! Your application to the FitPro App — 30-Day Challenge has been approved. Check your messages for the campaign brief.', time: '2 hr ago', read: false, actionLabel: 'View Campaign', actionHref: '/campaign-discovery' },
  { id: 'cn-004', type: 'message', title: 'New message from Luminary Skincare', description: 'Luminary Skincare sent feedback on your draft reel. They loved it but have a few minor tweaks to suggest.', time: '3 hr ago', read: false, actionLabel: 'Reply', actionHref: '/messaging-inbox' },
  { id: 'cn-005', type: 'alert', title: 'Deliverable deadline approaching', description: 'Your Summer Glow Skincare Launch deliverable is due in 3 days (May 1). Make sure to submit on time to receive payment.', time: '5 hr ago', read: true, urgent: true, actionLabel: 'View Details', actionHref: '/campaign-discovery' },
  { id: 'cn-006', type: 'invite', title: 'Campaign invite — TechDrop', description: 'TechDrop has invited you to review their new wireless earbuds. Budget: ₹800 per video. Platform: YouTube.', time: 'Yesterday', read: true, actionLabel: 'View Campaign', actionHref: '/campaign-discovery' },
  { id: 'cn-007', type: 'payment', title: 'Escrow locked — ₹950', description: '₹950 has been locked in escrow for the FitPro 30-Day Challenge. Funds will be released upon deliverable approval.', time: 'Yesterday', read: true },
  { id: 'cn-008', type: 'campaign', title: 'Application shortlisted — StyleForward', description: 'You\'ve been shortlisted for the StyleForward Fall Collection campaign. The brand will make a final decision within 48 hours.', time: '2 days ago', read: true },
  { id: 'cn-009', type: 'alert', title: 'KYC verification complete', description: 'Your identity has been verified successfully. You can now receive payments and apply to all campaigns on Viralbridgge.', time: '3 days ago', read: true },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  campaign: { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
  payment: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  message: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  invite: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function CreatorNotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); toast.success('All notifications marked as read'); };
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Campaign invites, payment updates, messages, and alerts</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        {(['all', 'unread'] as const).map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize ${filter === tab ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
            {tab === 'unread' && unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {displayed.map(notif => {
          const config = typeConfig[notif.type];
          const Icon = config.icon;
          return (
            <div key={notif.id} className={`bg-white rounded-xl border p-4 transition-all ${!notif.read ? (notif.urgent ? 'border-red-200 ring-1 ring-red-100' : 'border-violet-200 ring-1 ring-violet-50') : 'border-slate-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</p>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                      {notif.urgent && <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">Urgent</span>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                      <button onClick={() => dismiss(notif.id)} className="p-1 rounded hover:bg-slate-100 transition-colors ml-1"><X size={12} className="text-slate-400" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.description}</p>
                  <div className="flex items-center gap-2">
                    {notif.actionLabel && (
                      <a href={notif.actionHref ?? '#'} className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">{notif.actionLabel} →</a>
                    )}
                    {!notif.read && (
                      <button onClick={() => markRead(notif.id)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto">Mark read</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <Bell size={36} className="text-slate-300 mb-3" />
            <h3 className="text-slate-700 font-semibold mb-1">All caught up!</h3>
            <p className="text-slate-400 text-sm">No unread notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
