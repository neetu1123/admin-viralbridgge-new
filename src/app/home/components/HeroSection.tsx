'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/src/components/ui/AppImage';

const creatorAvatars = [
{ src: "https://images.unsplash.com/photo-1610533384348-bb69420eb838", alt: 'Creator Priya Sharma, lifestyle influencer' },
{ src: "https://img.rocket.new/generatedImages/rocket_gen_img_1be15d8e9-1772068858387.png", alt: 'Creator Marcus Williams, fitness influencer' },
{ src: "https://images.unsplash.com/photo-1695141306855-d2fb0ade5c33", alt: 'Creator Sofia Reyes, fashion influencer' }];


export default function HeroSection() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) return;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      el.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };
    const onMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateY(-4deg) rotateX(2deg)';
    };
    document.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-bg-base">
      {/* Background glows */}
      <div className="hero-glow w-[600px] h-[600px] bg-primary/10 top-[-100px] right-[-100px] absolute" />
      <div className="hero-glow w-[400px] h-[400px] bg-cta/6 bottom-[-80px] left-[-80px] absolute" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(78,64,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(78,64,241,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
      

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">

          {/* LEFT — Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="animate-clip-in">
              <span className="badge badge-primary">
                <span className="live-dot" />
                Live on 3,200+ active campaigns
              </span>
            </div>

            {/* Headline */}
            <div className="animate-clip-in delay-100">
              <h1 className="font-display text-[52px] lg:text-[60px] font-700 leading-[1.08] tracking-tight text-heading">
                Launch Influencer<br />
                Campaigns in{' '}
                <span className="text-gradient-primary">Minutes</span>
                <br />
                <span className="text-[42px] lg:text-[50px] font-300 text-sub">— Not Weeks</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="animate-fade-up delay-200 text-[17px] leading-relaxed text-sub max-w-[520px]">
              ViralBridgge connects brands with high-performing creators and
              influencers with brand deals. Real-time ROI tracking, verified creators,
              performance-based pricing.
            </p>

            {/* CTA row */}
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="#" className="btn-primary text-base">
                Launch Your Campaign
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="#marketplace" className="btn-secondary text-base">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
                </svg>
                Browse Creators
              </Link>
            </div>

            {/* Trust line */}
            <div className="animate-fade-up delay-400 flex items-center gap-3">
              <div className="flex -space-x-2">
                {creatorAvatars.map((av, i) =>
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                    <AppImage src={av.src} alt={av.alt} width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <p className="text-sm text-sub">
                Trusted by <span className="font-semibold text-heading">500+ brands</span> and{' '}
                <span className="font-semibold text-heading">12K+ creators</span>
              </p>
            </div>
          </div>

          {/* RIGHT — Dashboard Mock UI */}
          <div className="relative flex justify-center lg:justify-end">
            <div
              ref={dashboardRef}
              className="relative w-full max-w-[540px]"
              style={{ transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)', transition: 'transform 0.3s ease-out' }}>
              
              {/* Main dashboard card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 animate-clip-in delay-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Campaign Overview</p>
                    <p className="text-base font-semibold text-heading mt-0.5">Q1 2026 Performance</p>
                  </div>
                  <span className="badge badge-primary text-xs">
                    <span className="live-dot" />
                    Live
                  </span>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                  { label: 'Total Views', value: '2.4M', change: '+18%', up: true },
                  { label: 'Engagement', value: '8.2%', change: '+2.1%', up: true },
                  { label: 'Avg ROI', value: '3.4x', change: '+0.6x', up: true }].
                  map((m, i) =>
                  <div key={i} className="bg-bg-base rounded-xl p-3">
                      <p className="text-xs text-muted mb-1">{m.label}</p>
                      <p className="font-display text-xl font-700 text-heading">{m.value}</p>
                      <p className="text-xs font-semibold text-green-500 mt-0.5">{m.change}</p>
                    </div>
                  )}
                </div>

                {/* SVG Chart */}
                <div className="bg-bg-base rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Views over time</p>
                  <svg viewBox="0 0 360 90" className="w-full h-20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4E40F1" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#4E40F1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,72 L30,65 L60,58 L90,52 L120,44 L150,38 L180,30 L210,24 L240,18 L270,14 L300,10 L330,7 L360,4 L360,90 L0,90 Z"
                      fill="url(#chartGrad)" />
                    
                    <path
                      d="M0,72 L30,65 L60,58 L90,52 L120,44 L150,38 L180,30 L210,24 L240,18 L270,14 L300,10 L330,7 L360,4"
                      fill="none"
                      stroke="#4E40F1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round" />
                    
                    {[30, 90, 150, 210, 270, 330].map((cx, i) => {
                      const cys = [65, 52, 38, 24, 14, 7];
                      return <circle key={i} cx={cx} cy={cys[i]} r="3" fill="white" stroke="#4E40F1" strokeWidth="2" />;
                    })}
                  </svg>
                </div>

                {/* Creator mini cards */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Top Performing Creators</p>
                  {[
                  { name: 'Ananya Kapoor', cat: 'Fashion', followers: '420K', eng: '9.1%', src: "https://images.unsplash.com/photo-1695141306855-d2fb0ade5c33", alt: 'Ananya Kapoor fashion influencer profile' },
                  { name: 'Jordan Davis', cat: 'Fitness', followers: '310K', eng: '7.8%', src: "https://img.rocket.new/generatedImages/rocket_gen_img_15893e37c-1773034293433.png", alt: 'Jordan Davis fitness influencer profile' }].
                  map((c, i) =>
                  <div key={i} className="flex items-center gap-3 bg-bg-base rounded-xl px-3 py-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <AppImage src={c.src} alt={c.alt} width={32} height={32} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-heading truncate">{c.name}</p>
                        <p className="text-xs text-muted">{c.cat}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-heading">{c.followers}</p>
                        <p className="text-xs text-green-500 font-medium">{c.eng}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating ROI badge */}
              <div className="absolute -top-4 -right-4 glass-card px-4 py-3 animate-float shadow-md">
                <p className="text-xs text-muted">Campaign ROI</p>
                <p className="font-display text-xl font-700 text-primary">3.4x</p>
              </div>

              {/* Floating live badge */}
              <div className="absolute -bottom-4 -left-4 glass-card px-4 py-3 animate-float shadow-md" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <p className="text-xs font-semibold text-heading">120K views today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}