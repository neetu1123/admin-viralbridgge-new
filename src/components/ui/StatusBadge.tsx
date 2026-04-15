import React from 'react';

type StatusType =
  | 'pending' | 'accepted' | 'rejected' | 'active' | 'completed'
  | 'in_progress' | 'delivered' | 'draft' | 'archived' | 'verified'
  | 'banned' | 'flagged' | 'released' | 'escrow' | 'failed' | 'approved';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  accepted:    { label: 'Accepted',    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  approved:    { label: 'Approved',    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected:    { label: 'Rejected',    className: 'bg-red-50 text-red-700 border border-red-200' },
  active:      { label: 'Active',      className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  completed:   { label: 'Completed',   className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  delivered:   { label: 'Delivered',   className: 'bg-teal-50 text-teal-700 border border-teal-200' },
  draft:       { label: 'Draft',       className: 'bg-slate-50 text-slate-500 border border-slate-200' },
  archived:    { label: 'Archived',    className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  verified:    { label: 'Verified',    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  banned:      { label: 'Banned',      className: 'bg-red-50 text-red-700 border border-red-200' },
  flagged:     { label: 'Flagged',     className: 'bg-orange-50 text-orange-700 border border-orange-200' },
  released:    { label: 'Released',    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  escrow:      { label: 'In Escrow',   className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  failed:      { label: 'Failed',      className: 'bg-red-50 text-red-700 border border-red-200' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}