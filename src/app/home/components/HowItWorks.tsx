import React from 'react';
import { UserPlus, Send, DollarSign, Megaphone, Users, Handshake } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const CREATOR_STEPS = [
  {
    id: 'creator-step-1',
    step: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    desc: 'Connect your social accounts, set your niche, and showcase your best content. Verification takes under 24 hours.',
    color: '#7B2FF7',
    bg: '#EFEAFF',
  },
  {
    id: 'creator-step-2',
    step: '02',
    icon: Send,
    title: 'Apply to Campaigns',
    desc: 'Browse campaigns that match your niche and audience. Apply with one click — no lengthy proposal required.',
    color: '#F357A8',
    bg: '#FFF0F6',
  },
  {
    id: 'creator-step-3',
    step: '03',
    icon: DollarSign,
    title: 'Create & Get Paid',
    desc: 'Deliver your content, get brand approval, and receive payment directly to your bank — no chasing invoices.',
    color: '#F9A826',
    bg: '#FFF8EC',
  },
];

const BRAND_STEPS = [
  {
    id: 'brand-step-1',
    step: '01',
    icon: Megaphone,
    title: 'Post Your Campaign',
    desc: 'Define your deliverables, budget, timeline, and target audience. Your campaign goes live to 52,000+ creators instantly.',
    color: '#7B2FF7',
    bg: '#EFEAFF',
  },
  {
    id: 'brand-step-2',
    step: '02',
    icon: Users,
    title: 'Review Applicants',
    desc: 'Browse creator profiles with verified stats — followers, engagement rates, past brand deals, and audience demographics.',
    color: '#F357A8',
    bg: '#FFF0F6',
  },
  {
    id: 'brand-step-3',
    step: '03',
    icon: Handshake,
    title: 'Collaborate & Grow',
    desc: 'Approve content, track campaign performance in real time, and manage payments — all from your brand dashboard.',
    color: '#F9A826',
    bg: '#FFF8EC',
  },
];

function StepCard({
  step,
}: {
  step: { id: string; step: string; icon: React.ElementType; title: string; desc: string; color: string; bg: string };
}) {
  const Icon = step.icon;
  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-4 right-4 font-display font-800 text-[48px] leading-none text-[#F2F3F7] select-none">
        {step.step}
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative z-10"
        style={{ backgroundColor: step.bg }}
      >
        <Icon size={22} style={{ color: step.color }} />
      </div>
      <h3 className="font-display font-700 text-[#1F1F2E] text-base mb-2 relative z-10">{step.title}</h3>
      <p className="text-[#6B6B8A] text-sm leading-relaxed relative z-10">{step.desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#F8F7FC]">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#7B2FF7] font-semibold text-sm uppercase tracking-widest mb-4 font-display">
            How It Works
          </span>
          <h2 className="font-display font-800 text-4xl text-[#1F1F2E] tracking-tight">
            Built for both sides of the deal
          </h2>
          <p className="text-[#6B6B8A] text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Whether you are a creator looking for brand deals or a brand seeking authentic voices, ViralBridge makes it seamless.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Creators column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 rounded-full" style={{ background: 'linear-gradient(180deg, #7B2FF7, #F357A8)' }} />
              <h3 className="font-display font-700 text-xl text-[#1F1F2E]">For Creators</h3>
            </div>
            <div className="space-y-4">
              {CREATOR_STEPS.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
            </div>
          </div>

          {/* Brands column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 rounded-full" style={{ background: 'linear-gradient(180deg, #F357A8, #F9A826)' }} />
              <h3 className="font-display font-700 text-xl text-[#1F1F2E]">For Brands</h3>
            </div>
            <div className="space-y-4">
              {BRAND_STEPS.map((step) => (
                <StepCard key={step.id} step={step} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}