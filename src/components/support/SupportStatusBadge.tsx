import React from 'react';

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  WAITING_FOR_USER: { label: 'Waiting for You', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  WAITING_FOR_ADMIN: { label: 'Waiting for Admin', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  RESOLVED: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  REOPENED: { label: 'Reopened', className: 'bg-orange-50 text-orange-700 border border-orange-200' },
};

export default function SupportStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
