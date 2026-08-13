'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { supportApi } from '@/src/lib/api';
import type { SupportCase } from '@/src/lib/support/types';
import SupportStatusBadge from '@/src/components/support/SupportStatusBadge';

export function SupportCaseListContent() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi.getCases().then(setCases).catch(() => setCases([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  return (
    <div className="pb-8 max-w-3xl">
      <Link href="/support" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> Support
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Support Cases</h1>
      {cases.length === 0 ? (
        <p className="text-sm text-slate-500">No support cases yet.</p>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/support/case/${c.id}`} className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-slate-400">{c.caseNumber}</p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{c.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(c.updatedAt).toLocaleString()}</p>
                </div>
                <SupportStatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SupportCaseDetailContent({ caseId }: { caseId: string }) {
  const [supportCase, setCase] = useState<SupportCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    supportApi.getCase(caseId).then(setCase).catch(() => setCase(null)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [caseId]);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await supportApi.sendMessage(caseId, message.trim());
      setMessage('');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  if (!supportCase) {
    return <p className="text-slate-500">Case not found.</p>;
  }

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />
      <Link href="/support/cases" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> My Cases
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-mono text-violet-600">{supportCase.caseNumber}</p>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">{supportCase.subject}</h1>
          </div>
          <SupportStatusBadge status={supportCase.status} />
        </div>
        <p className="text-sm text-slate-600">{supportCase.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Conversation</p>
        </div>
        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {(supportCase.messages ?? []).map((m) => (
            <div key={m.id} className={`flex ${m.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.senderRole === 'ADMIN' ? 'bg-slate-100 text-slate-800' : 'bg-violet-600 text-white'
              }`}>
                <p className="text-[10px] opacity-70 mb-0.5">{m.senderRole}</p>
                <p>{m.message}</p>
                <p className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        {supportCase.status !== 'CLOSED' && supportCase.status !== 'RESOLVED' && (
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            />
            <button type="button" onClick={send} disabled={sending} className="p-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
