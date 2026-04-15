import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div
          className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, #7B2FF7 0%, #A855F7 40%, #F357A8 75%, #F9A826 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/5" />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles size={14} className="text-white" />
              <span className="text-white font-semibold text-sm font-display">Join 52,000+ creators today</span>
            </div>

            <h2 className="font-display font-800 text-4xl md:text-5xl text-white tracking-tight mb-6 leading-tight">
              Start Growing Today
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Whether you are a creator ready to monetize your audience or a brand looking for authentic partnerships — viralbridgge is where growth happens.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up-login-screen"
                className="bg-white text-[#7B2FF7] font-display font-700 px-8 py-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
              >
                Join as Creator
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-up-login-screen"
                className="border-2 border-white/60 text-white font-display font-700 px-8 py-3.5 rounded-xl hover:bg-white/10 hover:border-white transition-all duration-200 active:scale-[0.98]"
              >
                Hire Creators
              </Link>
            </div>

            <p className="mt-8 text-white/60 text-sm">
              Free to join · No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}