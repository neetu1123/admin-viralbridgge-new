'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, ExternalLink, Loader2, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { supportApi } from '@/src/lib/api';

type IssueDetail = Awaited<ReturnType<typeof supportApi.getIssue>>;

export default function SupportIssueContent({ issueId }: { issueId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState<{ solution?: string; actionUrl?: string; actionType?: string } | null>(null);
  const [showResolution, setShowResolution] = useState(false);

  useEffect(() => {
    supportApi
      .getIssue(issueId)
      .then(setIssue)
      .catch(() => {
        toast.error('Issue not found');
        router.push('/support');
      })
      .finally(() => setLoading(false));
  }, [issueId, router]);

  const handleCheckSolution = async () => {
    if (!issue) return;
    setResolving(true);
    try {
      const result = await supportApi.resolve({
        issueId: issue.id,
        campaignId: searchParams.get('campaignId') ?? undefined,
        paymentId: searchParams.get('paymentId') ?? undefined,
      });
      if (result.resolved) {
        setResolved({ solution: result.solution, actionUrl: result.actionUrl, actionType: result.actionType });
      } else {
        setShowResolution(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not check solution');
    } finally {
      setResolving(false);
    }
  };

  const createCase = () => {
    const params = new URLSearchParams({
      issueId: issue!.id,
      subject: issue!.title,
      categoryId: issue!.category.id,
      subcategoryId: issue!.subcategory.id,
    });
    if (searchParams.get('campaignId')) params.set('campaignId', searchParams.get('campaignId')!);
    router.push(`/support/case/new?${params.toString()}`);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  if (!issue) return null;

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />
      <Link href={`/support/category/${issue.category.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> {issue.category.name}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{issue.title}</h1>
      <p className="text-xs text-slate-500 mb-6">{issue.category.name} → {issue.subcategory.name}</p>

      {issue.description && (
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{issue.description}</p>
      )}

      {resolved?.solution && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-emerald-800 mb-1">Suggested Solution</p>
          <p className="text-sm text-emerald-700">{resolved.solution}</p>
          {resolved.actionUrl && (
            <Link href={resolved.actionUrl} className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-emerald-700 hover:underline">
              Take action <ExternalLink size={14} />
            </Link>
          )}
        </div>
      )}

      {!resolved && issue.solution && !showResolution && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-violet-800 mb-1">Quick Answer</p>
          <p className="text-sm text-violet-700">{issue.solution}</p>
          {issue.actionUrl && (
            <Link href={issue.actionUrl} className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-violet-700 hover:underline">
              Go to page <ExternalLink size={14} />
            </Link>
          )}
        </div>
      )}

      {!showResolution && !resolved && (
        <button
          type="button"
          onClick={handleCheckSolution}
          disabled={resolving}
          className="mb-6 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          {resolving ? 'Checking...' : 'Check my account status'}
        </button>
      )}

      {(showResolution || issue.requiresAdmin || resolved) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-800 mb-3">Did this solve your problem?</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { toast.success('Glad we could help!'); router.push('/support'); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100"
            >
              <ThumbsUp size={16} /> Yes, resolved
            </button>
            <button
              type="button"
              onClick={createCase}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700"
            >
              <ThumbsDown size={16} /> No, chat with Admin
            </button>
          </div>
        </div>
      )}

      {issue.requiresAdmin && !showResolution && !resolved && (
        <div className="mt-4">
          <button
            type="button"
            onClick={createCase}
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline"
          >
            <MessageCircle size={16} /> Chat with Admin about this issue
          </button>
        </div>
      )}
    </div>
  );
}
