'use client';
import React, { useEffect, useRef } from 'react';

const steps = [
  {
    num: '01',
    icon: '🎯',
    title: 'Create Your Campaign',
    desc: 'Set your goals, budget, target audience, and preferred creator categories in under 5 minutes.',
    color: '#4E40F1',
    bg: '#EEF2FF',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'Get Matched Instantly',
    desc: 'Our AI surfaces verified creators whose audience perfectly matches your campaign goals — no manual searching.',
    color: '#F22A57',
    bg: '#FFF0F3',
  },
  {
    num: '03',
    icon: '📊',
    title: 'Track & Scale',
    desc: 'Watch live metrics roll in. Double down on what works. Scale winning creators with one click.',
    color: '#22C55E',
    bg: '#DCFCE7',
  },
];

export default function HowItWorksSection() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.2 }
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="section-padding bg-bg-alt">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">How It Works</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            From brief to results<br />in 3 steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-14 left-[33%] right-[33%] h-[1px] bg-gradient-to-r from-primary/30 via-cta/30 to-green-400/30 z-0" />

          {steps.map((s, i) => (
            <div
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className="scroll-reveal bg-white rounded-2xl p-7 border border-gray-100 shadow-sm relative z-10"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {/* Step number */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: s.bg }}
                >
                  {s.icon}
                </div>
                <span
                  className="font-display text-4xl font-700 opacity-10"
                  style={{ color: s.color }}
                >
                  {s.num}
                </span>
              </div>
              <h3 className="font-display text-[19px] font-700 text-heading mb-3">{s.title}</h3>
              <p className="text-[15px] text-sub leading-relaxed">{s.desc}</p>

              {/* Arrow connector (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M6 15l6 6 6-6" stroke="#4E40F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}