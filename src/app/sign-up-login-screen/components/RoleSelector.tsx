'use client';

import React, { useState } from 'react';
import { Sparkles, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import type { UserRole } from './AuthFlow';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

const ROLES = [
  {
    id: 'role-creator' as const,
    value: 'creator' as const,
    icon: Sparkles,
    title: 'I am a Creator',
    subtitle: 'I create content and want to partner with brands',
    perks: [
      'Discover paid brand campaigns',
      'Get matched by niche & platform',
      'Receive payments directly',
      'Build your creator portfolio',
    ],
    color: '#7B2FF7',
    bg: '#EFEAFF',
    borderActive: '#7B2FF7',
  },
  {
    id: 'role-brand' as const,
    value: 'brand' as const,
    icon: Briefcase,
    title: 'I am a Brand',
    subtitle: 'I want to hire creators for my marketing campaigns',
    perks: [
      'Post campaigns in minutes',
      'Browse 52K+ verified creators',
      'Track ROI and performance',
      'Manage all collabs in one place',
    ],
    color: '#F357A8',
    bg: '#FFF0F6',
    borderActive: '#F357A8',
  },
];

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
  const [selected, setSelected] = useState<UserRole>(null);

  return (
    <div className="flex flex-col gap-6 flex-1">
      <p className="text-[#6B6B8A] text-sm leading-relaxed">
        Select the role that best describes you. You can always add another role later.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.value)}
            className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ₹{
              selected === role.value
                ? 'shadow-md scale-[1.01]'
                : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
            }`}
            style={
              selected === role.value
                ? {
                    borderColor: role.borderActive,
                    backgroundColor: role.bg,
                  }
                : {}
            }
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selected === role.value ? role.color : '#F2F3F7' }}
              >
                <role.icon
                  size={22}
                  style={{ color: selected === role.value ? 'white' : '#9AA0B4' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-700 text-[#1F1F2E] text-base">{role.title}</h3>
                  {selected === role.value && (
                    <CheckCircle size={18} style={{ color: role.color }} className="flex-shrink-0" />
                  )}
                </div>
                <p className="text-[#6B6B8A] text-sm mt-0.5 mb-3">{role.subtitle}</p>
                <ul className="space-y-1">
                  {role.perks.map((perk) => (
                    <li key={`perk-₹{role.id}-₹{perk}`} className="flex items-center gap-2 text-xs text-[#6B6B8A]">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="mt-auto w-full py-3.5 rounded-xl font-display font-700 text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={
          selected
            ? { background: 'linear-gradient(90deg, #7B2FF7, #F357A8)', color: 'white' }
            : { backgroundColor: '#E5E7EB', color: '#9AA0B4' }
        }
      >
        Continue as {selected === 'creator' ? 'Creator' : selected === 'brand' ? 'Brand' : '...'}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}