'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/src/components/ui/AppIcon';

const features = [
  {
    icon: 'RocketLaunchIcon',
    title: 'Launch Campaigns Instantly',
    desc: 'Go from brief to live campaign in under 10 minutes. No lengthy agency back-and-forth, no wasted days on approvals.',
    color: '#4E40F1',
    bg: '#EEF2FF',
  },
  {
    icon: 'ChartBarIcon',
    title: 'Track Everything in Real-Time',
    desc: 'Live dashboards show views, engagement, cost-per-result, and ROI as your campaign runs — updated every hour.',
    color: '#0EA5E9',
    bg: '#E0F2FE',
  },
  {
    icon: 'CurrencyDollarIcon',
    title: 'Pay for Performance, Not Promises',
    desc: 'Only pay when creators deliver results. Set KPI thresholds and release payment automatically when targets hit.',
    color: '#22C55E',
    bg: '#DCFCE7',
  },
  {
    icon: 'UserGroupIcon',
    title: 'Creators That Actually Convert',
    desc: 'Every creator is verified for authentic engagement. Our AI filters out inflated follower counts before you ever see them.',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
];

export default function FeaturesSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="features" className="section-padding bg-bg-base">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">Why ViralBridgge</span>
          <h2 className="font-display text-[36px] lg:text-[44px] font-700 text-heading tracking-tight leading-tight mb-4">
            Built for results,<br />not just reach
          </h2>
          <p className="text-[17px] text-sub leading-relaxed">
            Every feature is designed around one outcome: campaigns that drive real revenue, not vanity metrics.
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="feature-card spotlight-card scroll-reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
              onMouseMove={handleSpotlight}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: f.bg }}
              >
                <Icon name={f.icon as Parameters<typeof Icon>[0]['name']} size={22} style={{ color: f.color }} variant="solid" />
              </div>
              <h3 className="font-display text-[19px] font-700 text-heading mb-3">{f.title}</h3>
              <p className="text-[15px] text-sub leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}