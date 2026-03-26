'use client';
import React, { useEffect, useRef } from 'react';

const cases = [
  {
    brand: 'NovaSkin Co.',
    industry: 'Beauty & Skincare',
    campaign: 'Summer Glow Collection launch with 6 micro-influencers',
    views: '148K',
    engagement: '9.1%',
    roi: '4.2x',
    duration: '14 days',
    color: '#F59E0B',
    bg: '#FFFBEB',
    emoji: '✨',
  },
  {
    brand: 'IronFuel Nutrition',
    industry: 'Health & Fitness',
    campaign: 'Protein launch via 12 fitness creators across Instagram & YouTube',
    views: '320K',
    engagement: '7.4%',
    roi: '5.8x',
    duration: '21 days',
    color: '#22C55E',
    bg: '#F0FDF4',
    emoji: '💪',
  },
  {
    brand: 'UrbanThreads',
    industry: 'Fashion & Apparel',
    campaign: 'Street-style drop with 8 fashion creators on TikTok',
    views: '210K',
    engagement: '11.3%',
    roi: '3.8x',
    duration: '10 days',
    color: '#4E40F1',
    bg: '#EEF2FF',
    emoji: '👗',
  },
];

export default function CaseStudiesSection() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.15 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">Case Studies</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            Real campaigns,<br />real numbers
          </h2>
          <p className="text-[17px] text-sub mt-4">No cherry-picked stats. These are real campaigns run on ViralBridgge.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <div
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className="scroll-reveal bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              {/* Header stripe */}
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ background: c.bg }}
              >
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <h3 className="font-display text-[16px] font-700 text-heading">{c.brand}</h3>
                  <p className="text-xs text-muted">{c.industry}</p>
                </div>
              </div>

              {/* Campaign desc */}
              <div className="px-6 py-4 border-b border-gray-50">
                <p className="text-[13px] text-sub leading-relaxed">{c.campaign}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 divide-x divide-gray-50 px-0 py-0">
                {[
                  { label: 'Views', value: c.views, color: 'text-heading' },
                  { label: 'Engagement', value: c.engagement, color: 'text-green-500' },
                  { label: 'ROI', value: c.roi, color: `text-[${c.color}]` },
                ].map((m, j) => (
                  <div key={j} className="p-4 text-center">
                    <p className="font-display text-[20px] font-700" style={{ color: j === 2 ? c.color : undefined, ...(j === 1 ? { color: '#22C55E' } : {}) }}>
                      {m.value}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-muted">Duration: {c.duration}</span>
                <button className="text-xs font-semibold text-primary hover:underline">View full case study →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}