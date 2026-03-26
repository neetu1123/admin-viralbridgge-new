'use client';
import React, { useState, useEffect, useRef } from 'react';

const faqs = [
  {
    q: 'How does pricing work?',
    a: 'ViralBridgge offers three pricing models: Pay Per Campaign ($299/campaign), a monthly Performance Plan ($999/mo for unlimited campaigns), and a Commission-Based model (8% of spend) for agencies. No hidden fees, no retainers.',
  },
  {
    q: 'How do creators get paid?',
    a: 'Brands fund campaigns upfront into a secure escrow. Once a creator delivers content and hits the agreed KPIs, payment is automatically released within 24–48 hours. Creators never chase invoices.',
  },
  {
    q: 'How is ROI tracked?',
    a: 'ViralBridgge integrates with major platforms (Instagram, TikTok, YouTube) via official APIs to pull real-time metrics: views, engagement rate, clicks, and conversions. Your dashboard updates every hour.',
  },
  {
    q: 'How are creators verified?',
    a: 'Every creator goes through our AI-powered verification: we check follower authenticity scores, engagement rate history, past brand collaboration performance, and audience demographics before they appear in search results.',
  },
  {
    q: 'Can I cancel or pause a campaign?',
    a: 'Yes. You can pause a campaign at any time. Unused funds are returned to your account within 3–5 business days. There are no cancellation fees.',
  },
  {
    q: 'What platforms do you support?',
    a: 'Instagram, TikTok, YouTube, Twitter/X, and LinkedIn. We\'re adding Pinterest and Snapchat in Q2 2026.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('revealed'); },
      { threshold: 0.1 }
    );
    observer?.observe(el);
    return () => observer?.disconnect();
  }, []);

  return (
    <section id="faq" className="section-padding bg-bg-alt">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge badge-primary mb-4">FAQ</span>
          <h2 className="font-display text-[32px] lg:text-[40px] font-700 text-heading tracking-tight leading-tight">
            Questions we get<br />all the time
          </h2>
          <p className="text-[17px] text-sub mt-4">
             find your answer?{' '}
            <a href="#" className="text-primary font-semibold hover:underline">Chat with our team</a>
          </p>
        </div>

        <div
          ref={sectionRef}
          className="scroll-reveal max-w-2xl mx-auto space-y-3"
        >
          {faqs?.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-[15px] font-semibold text-heading pr-4">{faq?.q}</span>
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    open === i ? 'bg-primary text-white rotate-45' : 'bg-bg-alt text-primary'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ maxHeight: open === i ? '200px' : '0px' }}
              >
                <p className="px-6 pb-5 text-[15px] text-sub leading-relaxed">{faq?.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}