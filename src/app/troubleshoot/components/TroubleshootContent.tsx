'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, Phone, ChevronDown, ChevronUp, Search } from 'lucide-react';

const articles = [
  {
    id: 'escrow',
    q: 'Why can\'t I upload deliverables?',
    a: 'The brand must fund escrow first. Ask them to go to Review Deliverables → Fund Escrow. Upload unlocks when escrow status is HELD.',
  },
  {
    id: 'withdraw',
    q: 'How do I withdraw earnings?',
    a: 'Go to Wallet → Withdraw Funds. Enter amount and verify with OTP. Admin approves within 1–3 business days.',
  },
  {
    id: 'kyc',
    q: 'My KYC was rejected — what now?',
    a: 'Read the rejection reason in Settings → Verification, update your documents, and resubmit for admin review.',
  },
  {
    id: 'apply',
    q: 'How do I apply to a campaign?',
    a: 'Discover Campaigns → open a campaign → Apply. Include a strong message and optional proposed price.',
  },
  {
    id: 'payment',
    q: 'When do I get paid?',
    a: 'After the brand approves all deliverables, escrow releases to your wallet automatically (or after 7 days if brand does not review).',
  },
];

export default function TroubleshootContent() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(articles[0]?.id ?? null);
  const [showContact, setShowContact] = useState(false);

  const filtered = articles.filter(
    (a) =>
      a.q.toLowerCase().includes(query.toLowerCase()) ||
      a.a.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="pb-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <HelpCircle className="text-violet-600" size={24} />
        Troubleshoot a Problem
      </h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Search help articles first. Contact support if your issue is not resolved.</p>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      <div className="space-y-2 mb-8">
        {filtered.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {a.q}
              {openId === a.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openId === a.id && (
              <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{a.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-2">Still need help?</h2>
        <p className="text-xs text-slate-500 mb-4">If the articles above did not solve your issue, contact our support team.</p>
        {!showContact ? (
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            Show contact options →
          </button>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="mailto:support@viralbridge.io"
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300"
            >
              <Mail size={16} className="text-violet-600" /> Email Support
            </a>
            <a
              href="https://wa.me/917303655804"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300"
            >
              <MessageCircle size={16} className="text-emerald-600" /> WhatsApp Support
            </a>
            <button
              type="button"
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300 text-left"
            >
              <Phone size={16} className="text-blue-600" /> Request a Call Back
            </button>
            <span className="flex items-center gap-2 bg-white border border-dashed border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-400">
              Live chat — coming soon
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
