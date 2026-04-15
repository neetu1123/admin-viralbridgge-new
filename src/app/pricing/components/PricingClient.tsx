'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Star, Building2, Users } from 'lucide-react';

const CREATOR_PLANS = [
  {
    id: 'creator-free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for creators just getting started.',
    icon: <Users size={20} />,
    iconColor: '#6B6B8A',
    iconBg: '#F2F3F7',
    cta: 'Get Started Free',
    ctaStyle: 'secondary',
    features: [
      'Public creator profile',
      'Apply to up to 3 campaigns/month',
      'Basic analytics dashboard',
      'Community access',
      'Email support',
    ],
    notIncluded: [
      'Priority campaign matching',
      'Advanced analytics',
      'Verified badge',
      'Dedicated account manager',
    ],
  },
  {
    id: 'creator-pro',
    name: 'Pro',
    price: { monthly: 29, annual: 19 },
    description: 'For serious creators ready to scale their income.',
    icon: <Zap size={20} />,
    iconColor: '#7B2FF7',
    iconBg: '#EFEAFF',
    cta: 'Start Pro Trial',
    ctaStyle: 'primary',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited campaign applications',
      'Priority campaign matching',
      'Advanced analytics & insights',
      'Verified creator badge',
      'Media kit generator',
      'Early access to new campaigns',
      'Priority email support',
    ],
    notIncluded: [
      'Dedicated account manager',
    ],
  },
  {
    id: 'creator-elite',
    name: 'Elite',
    price: { monthly: 79, annual: 59 },
    description: 'For top-tier creators and agencies managing multiple accounts.',
    icon: <Star size={20} />,
    iconColor: '#F9A826',
    iconBg: '#FFF8EC',
    cta: 'Go Elite',
    ctaStyle: 'secondary',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom rate card',
      'Brand deal negotiation support',
      'Multi-profile management (up to 5)',
      'White-glove onboarding',
      'Exclusive brand partnerships',
      'Phone & priority support',
    ],
    notIncluded: [],
  },
];

const BRAND_PLANS = [
  {
    id: 'brand-starter',
    name: 'Starter',
    price: { monthly: 99, annual: 79 },
    description: 'Launch your first influencer campaign with ease.',
    icon: <Building2 size={20} />,
    iconColor: '#6B6B8A',
    iconBg: '#F2F3F7',
    cta: 'Start Hiring',
    ctaStyle: 'secondary',
    features: [
      '1 active campaign at a time',
      'Access to 10K+ creator profiles',
      'Basic campaign analytics',
      'In-app messaging',
      'Standard support',
    ],
    notIncluded: [
      'Multiple campaigns',
      'Advanced creator search',
      'Campaign performance reports',
      'Dedicated brand manager',
    ],
  },
  {
    id: 'brand-growth',
    name: 'Growth',
    price: { monthly: 299, annual: 229 },
    description: 'Scale your creator marketing with powerful tools.',
    icon: <Zap size={20} />,
    iconColor: '#7B2FF7',
    iconBg: '#EFEAFF',
    cta: 'Start Growth Trial',
    ctaStyle: 'primary',
    popular: true,
    features: [
      'Everything in Starter',
      'Up to 5 active campaigns',
      'Advanced creator search & filters',
      'Campaign performance reports',
      'Bulk outreach tools',
      'Contract & payment management',
      'Priority support',
    ],
    notIncluded: [
      'Dedicated brand manager',
    ],
  },
  {
    id: 'brand-enterprise',
    name: 'Enterprise',
    price: { monthly: 0, annual: 0 },
    description: 'Custom solutions for large brands and agencies.',
    icon: <Star size={20} />,
    iconColor: '#F357A8',
    iconBg: '#FFF0F6',
    cta: 'Contact Sales',
    ctaStyle: 'secondary',
    customPrice: true,
    features: [
      'Everything in Growth',
      'Unlimited active campaigns',
      'Dedicated brand manager',
      'Custom integrations & API access',
      'White-label reporting',
      'SLA & compliance support',
      'Custom contract terms',
      'Executive business reviews',
    ],
    notIncluded: [],
  },
];

const FAQS = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'How does billing work for annual plans?',
    a: 'Annual plans are billed once per year and offer significant savings compared to monthly billing.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for Enterprise plans.',
  },
  {
    q: 'Can brands and creators use the same account?',
    a: 'Currently, accounts are role-specific. You can create separate accounts for your brand and creator activities.',
  },
];

function PlanCard({ plan, annual }: { plan: typeof CREATOR_PLANS[0]; annual: boolean }) {
  const price = annual ? plan.price.annual : plan.price.monthly;
  const isCustom = 'customPrice' in plan && plan.customPrice;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col gap-5 ₹{
        plan.popular
          ? 'border-[#7B2FF7] shadow-[0_0_0_3px_rgba(123,47,247,0.12)] shadow-card-hover'
          : 'border-[#E5E7EB] shadow-card hover:shadow-card-hover hover:-translate-y-0.5'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#7B2FF7] via-[#F357A8] to-[#F9A826] text-white text-[11px] font-700 font-display px-3 py-1 rounded-full whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ color: plan.iconColor, backgroundColor: plan.iconBg }}
        >
          {plan.icon}
        </div>
        <div>
          <h3 className="font-display font-700 text-[#1F1F2E] text-lg">{plan.name}</h3>
          <p className="text-[#9AA0B4] text-xs">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div>
        {isCustom ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display font-800 text-4xl text-[#1F1F2E]">Custom</span>
          </div>
        ) : price === 0 ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display font-800 text-4xl text-[#1F1F2E]">Free</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-display font-800 text-4xl text-[#1F1F2E]">₹{price}</span>
            <span className="text-[#9AA0B4] text-sm font-medium">/ mo</span>
            {annual && (
              <span className="ml-2 text-[10px] font-semibold text-[#22C55E] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
                Save {Math.round((1 - plan.price.annual / plan.price.monthly) * 100)}%
              </span>
            )}
          </div>
        )}
        {annual && !isCustom && price > 0 && (
          <p className="text-[#9AA0B4] text-xs mt-1">Billed annually · ₹{price * 12}/yr</p>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/sign-up-login-screen"
        className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 ₹{
          plan.ctaStyle === 'primary' ?'btn-primary' :'border border-[#7B2FF7] text-[#7B2FF7] hover:bg-[#EFEAFF]'
        }`}
      >
        {plan.cta}
      </Link>

      {/* Features */}
      <div className="space-y-2.5">
        {plan.features.map((f) => (
          <div key={`feat-₹{f}`} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#EFEAFF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={10} className="text-[#7B2FF7]" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-[#6B6B8A]">{f}</span>
          </div>
        ))}
        {plan.notIncluded?.map((f) => (
          <div key={`not-feat-₹{f}`} className="flex items-start gap-2.5 opacity-40">
            <div className="w-4 h-4 rounded-full bg-[#F2F3F7] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#9AA0B4] text-[10px] font-bold">–</span>
            </div>
            <span className="text-sm text-[#9AA0B4]">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingClient() {
  const [annual, setAnnual] = useState(true);
  const [tab, setTab] = useState<'creators' | 'brands'>('creators');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = tab === 'creators' ? CREATOR_PLANS : BRAND_PLANS;

  return (
    <div className="bg-[#F8F7FC]">
      {/* Hero */}
      <section className="py-20 text-center px-6">
        <span className="inline-block text-[#7B2FF7] font-semibold text-sm uppercase tracking-widest mb-4 font-display">
          Pricing
        </span>
        <h1 className="font-display font-800 text-4xl lg:text-5xl text-[#1F1F2E] tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-[#6B6B8A] text-lg max-w-xl mx-auto mb-10">
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-card">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ₹{
              !annual ? 'bg-[#7B2FF7] text-white shadow-sm' : 'text-[#6B6B8A] hover:text-[#1F1F2E]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ₹{
              annual ? 'bg-[#7B2FF7] text-white shadow-sm' : 'text-[#6B6B8A] hover:text-[#1F1F2E]'
            }`}
          >
            Annual
            <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ₹{annual ? 'bg-white/20 text-white' : 'bg-[#F0FDF4] text-[#22C55E]'}`}>
              Save 30%
            </span>
          </button>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-card gap-1">
            <button
              onClick={() => setTab('creators')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ₹{
                tab === 'creators' ?'bg-[#EFEAFF] text-[#7B2FF7]' :'text-[#6B6B8A] hover:text-[#1F1F2E]'
              }`}
            >
              <Users size={15} />
              For Creators
            </button>
            <button
              onClick={() => setTab('brands')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ₹{
                tab === 'brands' ?'bg-[#EFEAFF] text-[#7B2FF7]' :'text-[#6B6B8A] hover:text-[#1F1F2E]'
              }`}
            >
              <Building2 size={15} />
              For Brands
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        {/* Feature comparison note */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-8 mb-20 text-center">
          <h2 className="font-display font-700 text-[#1F1F2E] text-2xl mb-3">
            All plans include
          </h2>
          <p className="text-[#6B6B8A] mb-8 max-w-lg mx-auto">
            Every viralbridgge account comes with these core features, no matter which plan you choose.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔒', label: 'Secure payments', desc: 'Escrow-protected deals' },
              { icon: '📊', label: 'Analytics', desc: 'Campaign performance data' },
              { icon: '💬', label: 'In-app messaging', desc: 'Direct brand-creator chat' },
              { icon: '🛡️', label: 'Fraud protection', desc: 'Verified profiles only' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-display font-700 text-[#1F1F2E] text-sm">{item.label}</p>
                <p className="text-[#9AA0B4] text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="font-display font-700 text-[#1F1F2E] text-2xl text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={`faq-₹{i}`}
                className="bg-white rounded-2xl border border-[#E5E7EB] shadow-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-display font-700 text-[#1F1F2E] text-sm pr-4">{faq.q}</span>
                  <span className={`text-[#7B2FF7] font-bold text-lg flex-shrink-0 transition-transform duration-200 ₹{openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#6B6B8A] border-t border-[#F2F3F7] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-[#EFEAFF] to-[#F8F7FC] rounded-3xl border border-[#E5E7EB] p-12 text-center mb-20">
          <h2 className="font-display font-800 text-3xl text-[#1F1F2E] mb-3">
            Still have questions?
          </h2>
          <p className="text-[#6B6B8A] mb-8 max-w-md mx-auto">
            Our team is happy to walk you through the right plan for your goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3">
              Start for Free
            </Link>
            <Link
              href="/sign-up-login-screen"
              className="border border-[#7B2FF7] text-[#7B2FF7] font-semibold px-8 py-3 rounded-xl hover:bg-[#EFEAFF] transition-colors text-sm"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
