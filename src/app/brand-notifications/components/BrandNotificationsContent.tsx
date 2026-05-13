'use client';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Bell, Users, DollarSign, MessageSquare, AlertCircle, TrendingUp, X, Check } from 'lucide-react';
import Icon from '@/src/components/ui/AppIcon';


interface Notification {
  id: string; type: 'applicant' | 'payment' | 'message' | 'alert' | 'milestone';
  title: string; description: string; time: string; read: boolean; urgent?: boolean;
  actionLabel?: string; actionHref?: string;
}

const initialNotifications: Notification[] = [
  { id: 'bn-001', type: 'applicant', title: 'New applicant — Summer Glow Campaign', description: 'Sofia Martinez applied to your Summer Glow Skincare Launch campaign. 48.2K followers · 5.2% engagement.', time: '2 min ago', read: false, urgent: false, actionLabel: 'Review Application', actionHref: '/brand-campaign-management' },
  { id: 'bn-002', type: 'applicant', title: '8 pending applicants need review', description: 'You have 8 creators awaiting approval across your active campaigns. Act now to avoid losing top talent.', time: '15 min ago', read: false, urgent: true, actionLabel: 'Review All', actionHref: '/brand-campaign-management' },
  { id: 'bn-003', type: 'payment', title: 'Payment released to Jordan Osei', description: '₹3,500 has been released from escrow to Jordan Osei for completing the FitPro 30-Day Challenge deliverables.', time: '1 hr ago', read: false, actionLabel: 'View Transaction', actionHref: '/brand-wallet' },
  { id: 'bn-004', type: 'message', title: 'New message from Sofia Martinez', description: 'Sofia sent a draft reel for your review. She\'s asking for feedback on the Summer Glow campaign content.', time: '2 hr ago', read: false, actionLabel: 'Reply', actionHref: '/brand-messages' },
  { id: 'bn-005', type: 'milestone', title: 'Campaign milestone — FitPro Challenge', description: 'The FitPro 30-Day Challenge has reached 100K total views across all creator content. Great performance!', time: '3 hr ago', read: true },
  { id: 'bn-006', type: 'alert', title: 'Budget alert — NomadPay Campaign', description: 'Your NomadPay Travel Creator Push has used 50% of its budget (₹4,000 / ₹8,000). Consider reviewing spend.', time: '5 hr ago', read: true, urgent: false },
  { id: 'bn-007', type: 'applicant', title: 'Creator shortlisted — Priya Nair', description: 'Priya Nair has been shortlisted for Summer Glow Skincare Launch. 92.1K followers · 4.1% engagement.', time: 'Yesterday', read: true },
  { id: 'bn-008', type: 'payment', title: 'Escrow funded — Summer Glow Campaign', description: '₹6,000 has been locked in escrow for the Summer Glow Skincare Launch campaign. Creators can now be approved.', time: 'Yesterday', read: true },
  { id: 'bn-009', type: 'milestone', title: 'Campaign completed — TechDrop Earbuds', description: 'TechDrop Q1 Earbuds Campaign has been completed successfully. Final ROI: 3.2x. All deliverables submitted.', time: '2 days ago', read: true },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  applicant: { icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  payment: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  message: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  alert: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  milestone: { icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
};

export default function BrandNotificationsContent() {
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
          <p className="text-slate-500 text-sm mt-1">Stay updated on applicants, payments, messages, and campaign activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium border border-violet-200 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors">
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
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
