'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { listingApi } from '@/src/lib/api';
import { getCurrentUser } from '@/src/lib/useAuth';
import { isLimitedAccess } from '@/src/lib/featureAccess';
import { toast } from 'sonner';

export default function SubscriptionContent() {
  const [limited, setLimited] = useState(true);
  const [requestedAt, setRequestedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setLimited(isLimitedAccess(user));
    void listingApi.getMine()
      .then((mine) => {
        setLimited((mine.featureAccess ?? 'LIMITED') !== 'FULL');
        setRequestedAt(mine.accessRequestedAt ?? null);
      })
      .catch(() => undefined);
  }, []);

  const requestAccess = async () => {
    setSaving(true);
    try {
      const result = await listingApi.requestAccess();
      setRequestedAt(result.requestedAt);
      setLimited(result.status !== 'FULL');
      toast.success(result.status === 'FULL' ? 'Full access is already active' : 'Request sent to admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-slate-800">Subscription</h1>
      <p className="text-sm text-slate-500 mt-1">
        Free accounts can list, grow with AI suggestions, and manage profile settings. Campaigns, wallet, and discovery unlock after a paid plan or admin approval.
      </p>

      <div className="mt-5 grid md:grid-cols-3 gap-4">
        {[
          { name: 'ViralBridge Basic', price: 'Free', items: ['Public listing', 'Grow my business CTA', 'Profile & settings'] },
          { name: 'Growth', price: '₹1,499–₹4,999/mo', items: ['Campaigns', 'Creator discovery', 'Wallet & analytics'] },
          { name: 'Enterprise', price: '₹25,000+/mo', items: ['Custom access', 'Priority support', 'Team tools'] },
        ].map((plan) => (
          <div key={plan.name} className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-violet-700">{plan.name}</p>
            <p className="text-xl font-bold text-slate-800 mt-2">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={14} className="text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        {limited ? (
          <>
            <h2 className="font-semibold text-slate-800">Unlock the rest of the portal</h2>
            <p className="text-sm text-slate-500 mt-1">
              An admin reviews access for now. After approval, campaigns, payments, and discovery stay on this same account.
            </p>
            <button
              type="button"
              onClick={() => void requestAccess()}
              disabled={saving || Boolean(requestedAt)}
              className="mt-4 inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {requestedAt ? 'Access requested' : 'Request full access'}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-slate-800">Full access is active</h2>
            <p className="text-sm text-slate-500 mt-1">Campaigns, wallet, and discovery tools are available on this account.</p>
            <Link href="/grow-business" className="inline-flex mt-4 text-sm font-semibold text-violet-700">
              Back to Grow my business
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
