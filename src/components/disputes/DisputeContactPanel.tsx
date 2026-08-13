'use client';

import React from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';

export default function DisputeContactPanel() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-6">
      <h2 className="text-sm font-bold text-slate-800 mb-1">Need help with a dispute?</h2>
      <p className="text-xs text-slate-500 mb-4">
        Our support team can help mediate campaign, deliverable, or payment disputes. Reach out using any option below.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <a
          href="mailto:support@viralbridge.io?subject=Dispute%20Support%20Request"
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300 transition-colors"
        >
          <Mail size={16} className="text-violet-600 shrink-0" />
          <span>Email: support@viralbridge.io</span>
        </a>
        <a
          href="https://wa.me/917303655804"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300 transition-colors"
        >
          <MessageCircle size={16} className="text-emerald-600 shrink-0" />
          <span>WhatsApp Support</span>
        </a>
        <a
          href="mailto:support@viralbridge.io?subject=Dispute%20Callback%20Request"
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300 transition-colors"
        >
          <Phone size={16} className="text-blue-600 shrink-0" />
          <span>Request a callback</span>
        </a>
        <a
          href="/support"
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 hover:border-violet-300 transition-colors"
        >
          <span className="text-violet-600 font-semibold text-xs w-4 text-center">?</span>
          <span>Help &amp; Support articles</span>
        </a>
      </div>
    </div>
  );
}
