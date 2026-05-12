'use client';
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const adminRoles = [
  { id: 'role-001', name: 'Super Admin', description: 'Full platform access — all modules, settings, and user management', permissions: ['Users', 'Campaigns', 'Finance', 'Moderation', 'System', 'Audit Logs'], assignedTo: 2, color: 'bg-violet-100 text-violet-700' },
  { id: 'role-002', name: 'Finance Admin', description: 'Access to transactions, escrow, payouts, and financial reports', permissions: ['Transactions', 'Escrow', 'Payouts', 'Analytics'], assignedTo: 1, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'role-003', name: 'Moderation Admin', description: 'Review flagged content, manage disputes, and enforce policies', permissions: ['Flagged Content', 'Disputes', 'Campaigns'], assignedTo: 3, color: 'bg-red-100 text-red-700' },
  { id: 'role-004', name: 'Support Admin', description: 'View-only access to users, campaigns, and disputes for support resolution', permissions: ['Users (View)', 'Campaigns (View)', 'Disputes (View)'], assignedTo: 5, color: 'bg-blue-100 text-blue-700' },
];

const adminMembers = [
  { id: 'adm-001', name: 'Admin User', email: 'admin@Viralbridgge.io', role: 'Super Admin', lastActive: '2026-04-14', status: 'active' },
  { id: 'adm-002', name: 'Raj Patel', email: 'raj@Viralbridgge.io', role: 'Finance Admin', lastActive: '2026-04-13', status: 'active' },
  { id: 'adm-003', name: 'Zara Ahmed', email: 'zara@Viralbridgge.io', role: 'Moderation Admin', lastActive: '2026-04-12', status: 'active' },
  { id: 'adm-004', name: 'Tom Chen', email: 'tom@Viralbridgge.io', role: 'Support Admin', lastActive: '2026-04-10', status: 'active' },
];

export default function RolesContent() {
  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Roles</h1>
          <p className="text-slate-500 text-sm mt-1">Manage role-based access control for admin team members</p>
        </div>
        <button onClick={() => toast?.success('Invite sent to new admin')} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Add Admin
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {adminRoles?.map(role => (
          <div key={role?.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${role?.color}`}>{role?.name}</span>
              <button onClick={() => toast?.success(`Editing ${role?.name}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><Edit size={13} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{role?.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {role?.permissions?.map(p => (
                <span key={p} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">{p}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400">{role?.assignedTo} member{role?.assignedTo !== 1 ? 's' : ''} assigned</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Admin Members</h2>
          <span className="text-xs text-slate-400">{adminMembers?.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Admin', 'Role', 'Last Active', 'Status', 'Actions']?.map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {adminMembers?.map(member => (
                <tr key={member?.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{member?.name?.slice(0, 2)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{member?.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{member?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-medium bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">{member?.role}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><p className="text-xs text-slate-500">{member?.lastActive}</p></td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toast?.success(`Editing ${member?.name}`)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors" title="Edit role"><Edit size={14} /></button>
                      {member?.role !== 'Super Admin' && <button onClick={() => toast?.success(`${member?.name} removed`)} className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors" title="Remove admin"><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
