'use client';

import React from 'react';

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export default function NotificationToggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
        checked ? 'border-violet-600 bg-violet-600' : 'border-slate-200 bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
