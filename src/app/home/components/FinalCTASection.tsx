'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('revealed'); },
      { threshold: 0.2 }
    );
    observer?.observe(el);
    return () => observer?.disconnect();
  }, []);

  return (
    <section className="section-padding bg-bg-base">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className="scroll-reveal relative overflow-hidden bg-gradient-to-br from-[#2d1f7a] via-[#4E40F1] to-[#3B82F6] rounded-3xl px-8 py-20 text-center"
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow blobs */}
          <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] bg-cta/25 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="live-dot" />
              3,200+ active campaigns right now
            </span>

            <h2 className="font-display text-[36px] lg:text-[52px] font-700 text-white leading-tight tracking-tight mb-6">
              Start your first campaign<br />today.
            </h2>

            <p className="text-[17px] text-white/75 mb-10 max-w-lg mx-auto leading-relaxed">
              Join 500+ brands already scaling with ViralBridgge. Your first campaign can go live in under 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-cta hover:shadow-lg hover:-translate-y-0.5"
              >
                🚀 Launch Campaign
              </Link>
              <Link
                href="#marketplace"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all"
              >
                Browse Creators
              </Link>
            </div>

            <p className="text-sm text-white/50 mt-6">
              No credit card required · Cancel anytime · First campaign free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}