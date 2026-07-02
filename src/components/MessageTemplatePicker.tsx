'use client';

import { templatesForRole } from '@/src/lib/messageTemplates';

export default function MessageTemplatePicker({
  role,
  onSelect,
}: {
  role: 'brand' | 'creator';
  onSelect: (text: string) => void;
}) {
  const templates = templatesForRole(role);

  return (
    <div className="mb-2">
      <p className="text-xs text-slate-500 mb-1.5 font-medium">Message templates</p>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.text)}
            className="text-xs px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
