import React from 'react';

type Platform = 'Instagram' | 'YouTube' | 'TikTok' | 'Twitter' | 'LinkedIn' | 'Pinterest' | 'Twitch';

const platformConfig: Record<Platform, { color: string; bg: string }> = {
  Instagram: { color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200' },
  YouTube:   { color: 'text-red-700',  bg: 'bg-red-50 border-red-200' },
  TikTok:    { color: 'text-slate-800', bg: 'bg-slate-100 border-slate-200' },
  Twitter:   { color: 'text-sky-700',  bg: 'bg-sky-50 border-sky-200' },
  LinkedIn:  { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  Pinterest: { color: 'text-red-600',  bg: 'bg-red-50 border-red-200' },
  Twitch:    { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

export default function PlatformBadge({ platform }: { platform: string }) {
  const config = platformConfig[platform as Platform] ?? { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.bg} ${config.color}`}>
      {platform}
    </span>
  );
}