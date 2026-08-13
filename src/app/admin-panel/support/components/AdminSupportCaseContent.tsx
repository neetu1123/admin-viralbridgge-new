'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/src/lib/useAuth';
import { adminSupportApi } from '@/src/lib/api';
import type { SupportCase } from '@/src/lib/support/types';
import SupportStatusBadge from '@/src/components/support/SupportStatusBadge';

export default function AdminSupportCaseContent({ caseId }: { caseId: string }) {
  const { user, loading: authLoading } = useAuth('admin');
  const [supportCase, setCase] = useState<SupportCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminSupportApi.getCase(caseId);
      setCase(data);
    } catch {
      setCase(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  const reply = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await adminSupportApi.reply(caseId, message.trim());
      setMessage('');
      load();
      toast.success('Reply sent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await adminSupportApi.addNote(caseId, note.trim());
      setNote('');
      load();
      toast.success('Note added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const action = async (type: 'resolve' | 'close' | 'reopen') => {
    try {
      if (type === 'resolve') await adminSupportApi.resolve(caseId);
      if (type === 'close') await adminSupportApi.close(caseId);
      if (type === 'reopen') await adminSupportApi.reopen(caseId);
      load();
      toast.success(`Case ${type}d`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const assignToMe = async () => {
    if (!user?.id) return;
    try {
      await adminSupportApi.assign(caseId, user.id);
      load();
      toast.success('Case assigned to you');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Assign failed');
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  if (!supportCase) {
    return <p className="text-slate-500">Case not found.</p>;
  }

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <Link href="/admin-panel/support" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> Support Cases
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-mono text-violet-600">{supportCase.caseNumber}</p>
                <h1 className="text-xl font-bold text-slate-800">{supportCase.subject}</h1>
              </div>
              <SupportStatusBadge status={supportCase.status} />
            </div>
            <p className="text-sm text-slate-600">{supportCase.description}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-sm">Conversation</div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {(supportCase.messages ?? []).map((m) => (
                <div key={m.id} className={`flex ${m.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.senderRole === 'ADMIN' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    <p className="text-[10px] opacity-70">{m.senderRole}</p>
                    <p>{m.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Reply to user..." className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2" />
              <button type="button" onClick={reply} disabled={sending} className="p-2.5 bg-violet-600 text-white rounded-lg"><Send size={16} /></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-2">
            <p><span className="text-slate-500">User:</span> {supportCase.userName}</p>
            <p><span className="text-slate-500">Email:</span> {supportCase.userEmail}</p>
            <p><span className="text-slate-500">Role:</span> {supportCase.userRole}</p>
            <p><span className="text-slate-500">Type:</span> {supportCase.caseType}</p>
            <p><span className="text-slate-500">Priority:</span> {supportCase.priority}</p>
            {supportCase.campaignId && <p><span className="text-slate-500">Campaign:</span> {supportCase.campaignId}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={assignToMe} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg">Assign to me</button>
            <button type="button" onClick={() => action('resolve')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg">Resolve</button>
            <button type="button" onClick={() => action('close')} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg">Close</button>
            <button type="button" onClick={() => action('reopen')} className="px-3 py-1.5 text-xs font-semibold bg-orange-50 text-orange-700 rounded-lg">Reopen</button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-800 uppercase mb-2">Internal Notes</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full text-sm border border-amber-200 rounded-lg px-2 py-1.5 mb-2" placeholder="Admin-only note..." />
            <button type="button" onClick={addNote} className="text-xs font-semibold text-amber-800">Add note</button>
            <div className="mt-3 space-y-2">
              {(supportCase.notes ?? []).map((n) => (
                <div key={n.id} className="text-xs bg-white rounded p-2 border border-amber-100">
                  <p>{n.note}</p>
                  <p className="text-slate-400 mt-1">{n.adminName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
