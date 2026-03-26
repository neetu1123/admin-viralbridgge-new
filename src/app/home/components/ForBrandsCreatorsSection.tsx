'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const brandPoints = [
  { icon: '🎯', text: 'Find high-performing creators by niche, audience, and engagement rate' },
  { icon: '📊', text: 'Track ROI in real-time with live dashboards and campaign analytics' },
  { icon: '⚡', text: 'Launch campaigns in under 10 minutes — no agency overhead' },
  { icon: '💳', text: 'Performance-based payments — only pay when KPIs are met' },
  { icon: '🔒', text: 'Fraud detection filters out fake followers before you spend a dollar' },
];

const creatorPoints = [
  { icon: '💼', text: 'Get matched with brand deals that fit your niche and audience' },
  { icon: '💰', text: 'Guaranteed payments — funds held in escrow before you start' },
  { icon: '📈', text: 'Build a consistent income stream with recurring brand partnerships' },
  { icon: '🌟', text: 'Verified creator badge builds trust and attracts premium brands' },
  { icon: '📱', text: 'Manage all your campaigns and earnings from one dashboard' },
];

export default function ForBrandsCreatorsSection() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.15 }
    );
    if (leftRef?.current) observer?.observe(leftRef?.current);
    if (rightRef?.current) observer?.observe(rightRef?.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            Built for both sides<br />of the deal
          </h2>
          <p className="text-[17px] text-sub mt-4 max-w-xl mx-auto">
            Whether you are a brand chasing ROI or a creator building income — ViralBridgge works for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* For Brands */}
          <div
            ref={leftRef}
            className="scroll-reveal-left bg-bg-alt rounded-2xl p-8 border border-primary/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg">🏢</div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">For Brands</p>
                <h3 className="font-display text-[22px] font-700 text-heading">Scale your campaigns</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {brandPoints?.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{p?.icon}</span>
                  <p className="text-[15px] text-sub leading-snug">{p?.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="#" className="btn-primary text-sm inline-flex">
                Start as a Brand
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* For Creators */}
          <div
            ref={rightRef}
            className="scroll-reveal-right bg-gradient-to-br from-[#1a1040] to-[#2d1f6e] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white text-lg">✨</div>
              <div>
                <p className="text-xs font-semibold text-primary-light uppercase tracking-wider">For Creators</p>
                <h3 className="font-display text-[22px] font-700 text-white">Monetize your content</h3>
              </div>
            </div>
            <ul className="space-y-4">
              {creatorPoints?.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{p?.icon}</span>
                  <p className="text-[15px] text-white/75 leading-snug">{p?.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="#"
                className="inline-flex items-center gap-2 bg-white text-primary text-sm font-semibold px-6 py-3 rounded-xl hover:bg-bg-alt transition-colors"
              >
                Join as Creator
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}