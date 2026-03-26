'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const plans = [
  {
    name: 'Pay Per Campaign',
    price: '$299',
    period: 'per campaign',
    desc: 'Perfect for brands testing influencer marketing for the first time.',
    features: [
      'Up to 5 creator collaborations',
      'Basic campaign analytics',
      'Standard creator matching',
      '14-day campaign window',
      'Email support',
    ],
    cta: 'Start a Campaign',
    featured: false,
  },
  {
    name: 'Performance Plan',
    price: '$999',
    period: 'per month',
    desc: 'For growth-stage brands running campaigns continuously.',
    features: [
      'Unlimited creator collaborations',
      'Real-time ROI dashboard',
      'AI-powered creator matching',
      'Unlimited campaign duration',
      'Priority support + account manager',
      'Fraud detection & verified creators',
    ],
    cta: 'Get Started',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Commission-Based',
    price: '8%',
    period: 'of campaign spend',
    desc: 'For agencies and large brands. Pay only when campaigns deliver.',
    features: [
      'Everything in Performance',
      'Multi-brand management',
      'Custom reporting & exports',
      'API access',
      'Dedicated success manager',
      'White-label option available',
    ],
    cta: 'Talk to Sales',
    featured: false,
  },
];

export default function PricingSection() {
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
    <section id="pricing" className="section-padding bg-bg-base">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">Pricing</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            Transparent pricing,<br />zero surprises
          </h2>
          <p className="text-[17px] text-sub mt-4">
            No retainers. No hidden fees. Pay for what you use.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((p, i) => (
            <div
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className={`scroll-reveal pricing-card ${p.featured ? 'featured' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {/* Badge */}
              {p.badge && (
                <div className="mb-4">
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {p.badge}
                  </span>
                </div>
              )}

              <h3 className={`font-display text-[18px] font-700 mb-1 ${p.featured ? 'text-white' : 'text-heading'}`}>
                {p.name}
              </h3>
              <p className={`text-[13px] mb-5 ${p.featured ? 'text-white/70' : 'text-sub'}`}>{p.desc}</p>

              {/* Price */}
              <div className="mb-6">
                <span className={`font-display text-[40px] font-700 ${p.featured ? 'text-white' : 'text-heading'}`}>
                  {p.price}
                </span>
                <span className={`text-sm ml-1 ${p.featured ? 'text-white/70' : 'text-muted'}`}>/ {p.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`mt-0.5 flex-shrink-0 ${p.featured ? 'text-white/80' : 'text-primary'}`}
                    >
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={`text-[14px] ${p.featured ? 'text-white/85' : 'text-sub'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="#"
                className={`block text-center text-sm font-semibold py-3 rounded-xl transition-all ${
                  p.featured
                    ? 'bg-white text-primary hover:bg-bg-alt' :'bg-primary text-white hover:bg-primary-dark shadow-primary'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}