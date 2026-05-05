import AppLayout from '@/src/components/AppLayout';
import AdminTopNavbar from '../components/AdminTopNavbar';

export default function AdminSettingsPage() {
  return (
    <AppLayout role="admin" topNavbar={<AdminTopNavbar />}>
      <div className="pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Platform configuration and admin preferences</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: 'Platform Fee', desc: 'Current fee rate applied to all transactions', value: '5%', action: 'Edit' },
            { title: 'Escrow Hold Period', desc: 'Days funds are held before auto-release', value: '14 days', action: 'Edit' },
            { title: 'KYC Required', desc: 'Require KYC verification before first payout', value: 'Enabled', action: 'Toggle' },
            { title: 'AI Matching', desc: 'Automatic creator-campaign matching engine', value: 'Active', action: 'Toggle' },
          ]?.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{s?.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s?.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-violet-700">{s?.value}</span>
                <button className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">{s?.action}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
