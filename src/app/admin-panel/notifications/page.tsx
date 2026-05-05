import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';

export default function AdminNotificationsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <div className="pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Platform alerts and system notifications</p>
        </div>
        <div className="space-y-3">
          {[
            { title: 'Campaign flagged for review', desc: 'Suspicious Crypto Giveaway has been flagged by 8 users', time: '2 min ago', type: 'red' },
            { title: 'New withdrawal request', desc: 'Priya Nair requested $2,000 withdrawal via Bank Transfer', time: '15 min ago', type: 'amber' },
            { title: 'Dispute escalated', desc: 'GameVault Pro Controller dispute escalated to senior team', time: '1 hr ago', type: 'orange' },
            { title: 'New creator signup', desc: 'Marcus Webb joined as a creator — KYC pending', time: '2 hr ago', type: 'blue' },
            { title: 'Escrow released', desc: '$1,200 released to Sofia Martinez for Summer Glow campaign', time: '3 hr ago', type: 'green' },
          ]?.map((n, i) => (
            <div key={i} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${n?.type === 'red' ? 'border-red-200' : n?.type === 'amber' ? 'border-amber-200' : 'border-slate-200'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n?.type === 'red' ? 'bg-red-500' : n?.type === 'amber' ? 'bg-amber-500' : n?.type === 'orange' ? 'bg-orange-500' : n?.type === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{n?.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n?.desc}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{n?.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
