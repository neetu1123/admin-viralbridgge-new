'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/src/components/ui/AppImage';
import { TrendingUp, Users, Zap, Star, CheckCircle, ArrowRight } from 'lucide-react';

const PLATFORM_BADGES = [
{ name: 'Instagram', color: '#E1306C', bg: '#FFF0F6' },
{ name: 'TikTok', color: '#1F1F2E', bg: '#F2F3F7' },
{ name: 'YouTube', color: '#FF0000', bg: '#FFF5F5' },
{ name: 'Twitter/X', color: '#1DA1F2', bg: '#F0F8FF' }];


const MOCK_CREATORS = [
{
  id: 'creator-hero-001',
  name: 'Sofia Chen',
  handle: '@sofiabeauty',
  niche: 'Beauty',
  followers: '284K',
  engagement: '6.8%',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a2a4b7c2-1763296462144.png",
  alt: 'Young Asian woman smiling with long dark hair against neutral background',
  platform: 'Instagram'
},
{
  id: 'creator-hero-002',
  name: 'Marcus Reid',
  handle: '@marcusfitness',
  niche: 'Fitness',
  followers: '512K',
  engagement: '4.2%',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13145da71-1773203122086.png",
  alt: 'Athletic Black man with short hair wearing white t-shirt against light background',
  platform: 'YouTube'
},
{
  id: 'creator-hero-003',
  name: 'Priya Sharma',
  handle: '@priyacooks',
  niche: 'Food',
  followers: '198K',
  engagement: '8.1%',
  avatar: "https://images.unsplash.com/photo-1652396944757-ad27b62b33f6",
  alt: 'Indian woman with bright smile and curly hair in warm-toned setting',
  platform: 'TikTok'
}];


const STATS_MINI = [
{ id: 'stat-hero-1', label: 'Active Campaigns', value: '1,240+', icon: Zap, color: '#7B2FF7' },
{ id: 'stat-hero-2', label: 'Verified Creators', value: '52K+', icon: Users, color: '#F357A8' },
{ id: 'stat-hero-3', label: 'Avg. Engagement', value: '5.4%', icon: TrendingUp, color: '#F9A826' }];


export default function HeroSection() {
  const [activeCreator, setActiveCreator] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCreator((prev) => (prev + 1) % MOCK_CREATORS?.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-[-100px] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7B2FF7, transparent 70%)' }} />
        
        <div
          className="absolute bottom-0 right-[-80px] w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #F357A8, transparent 70%)' }} />
        
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #7B2FF7, transparent 60%)' }} />
        
      </div>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#EFEAFF] rounded-full px-4 py-2">
              <Star size={14} className="text-[#7B2FF7] fill-[#7B2FF7]" />
              <span className="text-[#7B2FF7] font-semibold text-sm font-display">
                #1 Creator Marketplace in 2026
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-display text-5xl xl:text-6xl font-800 leading-[1.1] tracking-tight text-[#1F1F2E]">
                Connect Brands
                <br />
                with Creators{' '}
                <span className="gradient-text">Instantly</span>
              </h1>
              <p className="mt-6 text-[#6B6B8A] text-lg leading-relaxed max-w-lg font-body">
                viralbridgge is the all-in-one platform where brands find authentic creators, launch campaigns, and track ROI — while creators discover paid opportunities that match their niche.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3">
              {[
              'No upfront fees',
              'Verified creators only',
              'Instant matching']?.
              map((item) =>
              <div key={`trust-₹{item}`} className="flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-[#7B2FF7]" />
                  <span className="text-[#6B6B8A] text-sm font-medium">{item}</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up-login-screen" className="btn-primary flex items-center gap-2 text-base">
                Join as Creator
                <ArrowRight size={16} />
              </Link>
              <Link href="/sign-up-login-screen" className="btn-secondary flex items-center gap-2 text-base">
                Hire Creators
              </Link>
            </div>

            {/* Platform badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[#9AA0B4] text-sm font-medium">Works with</span>
              {PLATFORM_BADGES?.map((p) =>
              <span
                key={`platform-badge-₹{p?.name}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E5E7EB]"
                style={{ color: p?.color, backgroundColor: p?.bg }}>
                
                  {p?.name}
                </span>
              )}
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            {/* Main dashboard card */}
            <div className="relative z-10 bg-white rounded-3xl border border-[#E5E7EB] shadow-card-hover p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-700 text-[#1F1F2E] text-base">Campaign Dashboard</h3>
                  <p className="text-[#9AA0B4] text-xs mt-0.5">April 2026 — Active</p>
                </div>
                <span className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                  Live
                </span>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {STATS_MINI?.map((stat) =>
                <div key={stat?.id} className="bg-[#F8F7FC] rounded-xl p-3 text-center">
                    <stat.icon size={16} style={{ color: stat?.color }} className="mx-auto mb-1" />
                    <div className="font-display font-700 text-[#1F1F2E] text-sm tabular-nums">{stat?.value}</div>
                    <div className="text-[#9AA0B4] text-[10px] mt-0.5 font-medium">{stat?.label}</div>
                  </div>
                )}
              </div>

              {/* Creator list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#1F1F2E] font-display font-600 text-sm">Top Applicants</span>
                  <span className="text-[#7B2FF7] text-xs font-medium cursor-pointer hover:underline">View all</span>
                </div>
                {MOCK_CREATORS?.map((creator, idx) =>
                <div
                  key={creator?.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 cursor-pointer ₹{
                  idx === activeCreator ?
                  'bg-[#EFEAFF] border border-[#7B2FF7]/20' :
                  'hover:bg-[#F8F7FC]'}`
                  }>
                  
                    <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#F2F3F7]">
                      <AppImage
                      src={creator?.avatar}
                      alt={creator?.alt}
                      fill
                      className="object-cover"
                      sizes="36px" />
                    
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-600 text-[#1F1F2E] text-xs truncate">{creator?.name}</div>
                      <div className="text-[#9AA0B4] text-[10px]">{creator?.handle}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[#1F1F2E] font-display font-700 text-xs tabular-nums">{creator?.followers}</div>
                      <div className="text-green-500 text-[10px] font-medium tabular-nums">{creator?.engagement}</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#F2F3F7] text-[#6B6B8A]">
                      {creator?.niche}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#6B6B8A] font-medium">Campaign Progress</span>
                  <span className="text-[#1F1F2E] font-display font-700 tabular-nums">68%</span>
                </div>
                <div className="h-2 bg-[#F2F3F7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '68%',
                      background: 'linear-gradient(90deg, #7B2FF7, #F357A8)'
                    }} />
                  
                </div>
                <div className="flex justify-between text-[10px] text-[#9AA0B4] mt-1">
                  <span>₹8,160 spent</span>
                  <span>₹12,000 budget</span>
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-3.5 flex items-center gap-3 w-56 z-20">
              <div className="w-8 h-8 rounded-full bg-[#EFEAFF] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-[#7B2FF7]" />
              </div>
              <div>
                <div className="text-[#1F1F2E] font-display font-700 text-xs">New Application!</div>
                <div className="text-[#9AA0B4] text-[10px]">Sofia Chen applied to your campaign</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-card p-3.5 flex items-center gap-3 w-52 z-20">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-green-500" />
              </div>
              <div>
                <div className="text-[#1F1F2E] font-display font-700 text-xs">Payment Sent!</div>
                <div className="text-[#9AA0B4] text-[10px]">₹2,400 to Marcus Reid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);




}