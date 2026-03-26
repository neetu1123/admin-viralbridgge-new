'use client';
import React, { useEffect, useRef } from 'react';

const rows = [
  { feature: 'Campaign launch time', vb: '< 10 minutes', agency: '2–4 weeks' },
  { feature: 'Real-time ROI tracking', vb: '✓', agency: '✗' },
  { feature: 'Cost per campaign', vb: 'From $299', agency: '$5,000–$50,000+' },
  { feature: 'Creator verification', vb: '✓ AI-powered', agency: 'Manual / inconsistent' },
  { feature: 'Performance-based pay', vb: '✓', agency: '✗' },
  { feature: 'Transparent reporting', vb: '✓ Live dashboard', agency: 'Monthly PDF' },
  { feature: 'Fraud detection', vb: '✓ Automated', agency: 'Rarely included' },
  { feature: 'Time to first result', vb: '24–48 hours', agency: '4–8 weeks' },
];

export default function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('revealed'); },
      { threshold: 0.1 }
    );
    observer?.observe(el);
    return () => observer?.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">Why Switch</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            ViralBridgge vs<br />Traditional Agencies
          </h2>
          <p className="text-[17px] text-sub mt-4">
            The math close. See why 500+ brands moved off agencies.
          </p>
        </div>

        <div
          ref={ref}
          className="scroll-reveal bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl mx-auto"
        >
          {/* Table header */}
          <div className="grid grid-cols-3 bg-bg-base border-b border-gray-100">
            <div className="px-6 py-4 text-sm font-semibold text-sub">Feature</div>
            <div className="px-6 py-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-700 font-display text-primary bg-primary/8 px-3 py-1 rounded-full">
                ViralBridgge
              </span>
            </div>
            <div className="px-6 py-4 text-center text-sm font-semibold text-sub">Traditional Agency</div>
          </div>

          {/* Rows */}
          {rows?.map((r, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 border-b border-gray-50 last:border-0 hover:bg-bg-base/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
            >
              <div className="px-6 py-4 text-[14px] text-sub font-medium">{r?.feature}</div>
              <div className="px-6 py-4 text-center">
                {r?.vb === '✓' || r?.vb?.startsWith('✓') ? (
                  <span className="text-[14px] font-semibold text-green-600">{r?.vb}</span>
                ) : (
                  <span className="text-[14px] font-semibold text-primary">{r?.vb}</span>
                )}
              </div>
              <div className="px-6 py-4 text-center">
                {r?.agency === '✗' ? (
                  <span className="text-[14px] font-semibold text-red-400">{r?.agency}</span>
                ) : (
                  <span className="text-[14px] text-muted">{r?.agency}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}