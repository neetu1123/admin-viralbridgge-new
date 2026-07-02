'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ProfilePrompt } from '@/src/lib/profileCompletion';

export default function ProfileCompletionBanner({
  percent,
  prompts,
  role,
}: {
  percent: number;
  prompts: ProfilePrompt[];
  role: 'creator' | 'brand';
}) {
  if (percent >= 100) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-slate-800">Profile {percent}% complete</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete your {role} profile to get better matches and faster approvals.
          </p>
        </div>
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-violet-100">
            <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-xs font-bold text-violet-700">{percent}%</span>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2">
        {prompts.slice(0, 4).map((p) => (
          <li key={p.id}>
            <Link
              href={p.href ?? '#'}
              className="flex items-center gap-2 text-xs text-slate-600 hover:text-violet-700 transition-colors"
            >
              <Circle size={12} className="text-violet-400 flex-shrink-0" />
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
      {percent >= 80 && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700 mt-3 font-medium">
          <CheckCircle2 size={14} /> Almost there — finish the last steps to unlock full visibility.
        </p>
      )}
    </div>
  );
}
