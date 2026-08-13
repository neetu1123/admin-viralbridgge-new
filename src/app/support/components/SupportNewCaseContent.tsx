'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { supportApi } from '@/src/lib/api';

export default function SupportNewCaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get('subject') ?? '');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const created = await supportApi.createCase({
        subject: subject.trim(),
        description: description.trim(),
        issueId: searchParams.get('issueId') ?? undefined,
        categoryId: searchParams.get('categoryId') ?? undefined,
        subcategoryId: searchParams.get('subcategoryId') ?? undefined,
        campaignId: searchParams.get('campaignId') ?? undefined,
        paymentId: searchParams.get('paymentId') ?? undefined,
        contextJson: {
          currentPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
          referrer: searchParams.get('from') ?? undefined,
          timestamp: new Date().toISOString(),
        },
      });
      toast.success(`Case ${created.caseNumber} created`);
      router.push(`/support/case/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-8 max-w-2xl">
      <Toaster position="bottom-right" richColors />
      <Link href="/support" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> Back to Support
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Chat with Admin</h1>
      <p className="text-sm text-slate-500 mb-6">Describe your issue — we&apos;ll attach your account context automatically.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Describe your issue</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
            placeholder="Tell us what happened and what you need help with..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Creating case...' : 'Submit & Start Chat'}
        </button>
      </form>
    </div>
  );
}
