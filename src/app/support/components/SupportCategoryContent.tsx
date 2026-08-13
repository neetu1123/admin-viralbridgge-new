'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supportApi } from '@/src/lib/api';
import type { SupportCategory } from '@/src/lib/support/types';

export default function SupportCategoryContent({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi
      .getCategory(categoryId)
      .then(setCategory)
      .catch(() => {
        toast.error('Category not found');
        router.push('/support');
      })
      .finally(() => setLoading(false));
  }, [categoryId, router]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={32} /></div>;
  }

  if (!category) return null;

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />
      <Link href="/support" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> Support
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">{category.name}</h1>
      {category.description && <p className="text-sm text-slate-500 mb-6">{category.description}</p>}

      <div className="space-y-4">
        {category.subcategories.map((sub) => (
          <div key={sub.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">{sub.name}</p>
            </div>
            <div className="divide-y divide-slate-100">
              {sub.issues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => router.push(`/support/issue/${issue.id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-sm text-slate-700">{issue.title}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
