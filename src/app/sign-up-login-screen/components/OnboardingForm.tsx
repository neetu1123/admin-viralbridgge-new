'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from './AuthFlow';
import Link from 'next/link';

interface CreatorOnboarding {
  instagramHandle?: string;
  tiktokHandle?: string;
  youtubeChannel?: string;
  niche: string;
  followersCount: string;
  contentStyle: string;
  bio: string;
}

interface BrandOnboarding {
  industry: string;
  companySize: string;
  monthlyBudget: string;
  targetAudience: string;
  campaignGoal: string;
  preferredPlatforms: string[];
}

type OnboardingFormData = CreatorOnboarding | BrandOnboarding;

interface OnboardingFormProps {
  role: UserRole;
}

const CREATOR_NICHES = [
  'Beauty & Skincare', 'Fitness & Health', 'Food & Cooking', 'Fashion & Style',
  'Travel & Adventure', 'Tech & Gadgets', 'Gaming', 'Lifestyle', 'Education',
  'Finance', 'Parenting', 'Pets', 'Home & Decor', 'Music & Entertainment',
];

const FOLLOWER_RANGES = [
  '1K – 10K (Nano)', '10K – 50K (Micro)', '50K – 200K (Mid-tier)',
  '200K – 1M (Macro)', '1M+ (Mega)',
];

const BRAND_INDUSTRIES = [
  'Beauty & Cosmetics', 'Fashion & Apparel', 'Food & Beverage', 'Health & Wellness',
  'Technology & SaaS', 'Gaming & Entertainment', 'Finance & Fintech', 'Travel & Hospitality',
  'Home & Lifestyle', 'Sports & Fitness', 'Education & E-learning', 'Retail & E-commerce',
];

const BUDGET_RANGES = [
  'Under $1,000/month', '$1,000 – $5,000/month', '$5,000 – $20,000/month',
  '$20,000 – $50,000/month', '$50,000+/month',
];

const COMPANY_SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '201–1,000 employees', '1,000+ employees'];

const CAMPAIGN_GOALS = [
  'Brand awareness', 'Product launch', 'Sales & conversions', 'App installs',
  'Event promotion', 'Community building', 'Content creation',
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Pinterest', 'LinkedIn'];

export default function OnboardingForm({ role }: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>();

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const onSubmit = async () => {
    setLoading(true);
    // TODO: Backend integration — POST /api/onboarding with role-specific profile data
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setLoading(false);
    setDone(true);
    toast.success('Profile set up! Welcome to ViralBridge 🎉');
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center py-8">
        <div className="w-20 h-20 rounded-full bg-[#EFEAFF] flex items-center justify-center">
          <CheckCircle size={40} className="text-[#7B2FF7]" />
        </div>
        <div>
          <h3 className="font-display font-800 text-2xl text-[#1F1F2E] mb-2">You are all set!</h3>
          <p className="text-[#6B6B8A] text-base leading-relaxed max-w-xs mx-auto">
            {role === 'creator' ?'Your creator profile is live. Start browsing brand campaigns now.' :'Your brand account is ready. Post your first campaign and find your perfect creators.'}
          </p>
        </div>
        <Link
          href={role === 'creator' ? '/creators-explore-page' : '/homepage'}
          className="btn-primary flex items-center gap-2"
        >
          {role === 'creator' ? 'Explore Campaigns' : 'Post a Campaign'}
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1 overflow-y-auto">
      {role === 'creator' ? (
        <>
          <p className="text-[#6B6B8A] text-sm leading-relaxed">
            Connect your social accounts and set your niche so brands can discover you.
          </p>

          {/* Social handles */}
          <div className="space-y-4">
            <div>
              <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="#E1306C" stroke="none"/></svg> Instagram handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0B4] text-sm">@</span>
                <input
                  {...register('instagramHandle' as keyof CreatorOnboarding)}
                  type="text"
                  placeholder="sofiabeauty"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
                />
              </div>
            </div>

            <div>
              <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5 flex items-center gap-1.5">
                <span className="text-xs font-bold bg-[#1F1F2E] text-white px-1.5 py-0.5 rounded">TT</span> TikTok handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA0B4] text-sm">@</span>
                <input
                  {...register('tiktokHandle' as keyof CreatorOnboarding)}
                  type="text"
                  placeholder="sofiabeauty"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
                />
              </div>
            </div>

            <div>
              <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#FF0000" stroke="none"/></svg> YouTube channel URL
              </label>
              <input
                {...register('youtubeChannel' as keyof CreatorOnboarding)}
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
              />
            </div>
          </div>

          {/* Niche */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Primary niche <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('niche' as keyof CreatorOnboarding, { required: 'Please select your niche' })}
              className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 bg-white ${
                errors['niche' as keyof typeof errors] ? 'border-red-400' : 'border-[#E5E7EB]'
              }`}
            >
              <option value="">Select your content niche</option>
              {CREATOR_NICHES.map((niche) => (
                <option key={`niche-${niche}`} value={niche}>{niche}</option>
              ))}
            </select>
            {errors['niche' as keyof typeof errors] && (
              <p className="text-red-500 text-xs mt-1">{String(errors['niche' as keyof typeof errors]?.message)}</p>
            )}
          </div>

          {/* Followers */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Total followers (across all platforms) <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('followersCount' as keyof CreatorOnboarding, { required: 'Please select follower range' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            >
              <option value="">Select follower range</option>
              {FOLLOWER_RANGES.map((range) => (
                <option key={`followers-${range}`} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Creator bio <span className="text-[#F357A8]">*</span>
            </label>
            <p className="text-[#9AA0B4] text-xs mb-1.5">Tell brands what makes your content unique — 2–3 sentences</p>
            <textarea
              {...register('bio' as keyof CreatorOnboarding, {
                required: 'Bio is required',
                minLength: { value: 40, message: 'Bio should be at least 40 characters' },
              })}
              rows={3}
              placeholder="I create authentic beauty content for Gen Z audiences, focusing on sustainable skincare and budget-friendly routines..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 resize-none"
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-[#6B6B8A] text-sm leading-relaxed">
            Tell us about your brand so we can surface the most relevant creators for your campaigns.
          </p>

          {/* Industry */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Industry <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('industry' as keyof BrandOnboarding, { required: 'Industry is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            >
              <option value="">Select your industry</option>
              {BRAND_INDUSTRIES.map((industry) => (
                <option key={`industry-${industry}`} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Company size */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Company size <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('companySize' as keyof BrandOnboarding, { required: 'Company size is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            >
              <option value="">Select company size</option>
              {COMPANY_SIZES.map((size) => (
                <option key={`size-${size}`} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Monthly budget */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Monthly influencer marketing budget <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('monthlyBudget' as keyof BrandOnboarding, { required: 'Budget range is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            >
              <option value="">Select monthly budget</option>
              {BUDGET_RANGES.map((budget) => (
                <option key={`budget-${budget}`} value={budget}>{budget}</option>
              ))}
            </select>
          </div>

          {/* Campaign goal */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Primary campaign goal <span className="text-[#F357A8]">*</span>
            </label>
            <select
              {...register('campaignGoal' as keyof BrandOnboarding, { required: 'Campaign goal is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            >
              <option value="">Select primary goal</option>
              {CAMPAIGN_GOALS.map((goal) => (
                <option key={`goal-${goal}`} value={goal}>{goal}</option>
              ))}
            </select>
          </div>

          {/* Preferred platforms */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Preferred platforms
            </label>
            <p className="text-[#9AA0B4] text-xs mb-2">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={`platform-select-${platform}`}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    selectedPlatforms.includes(platform)
                      ? 'bg-[#7B2FF7] border-[#7B2FF7] text-white'
                      : 'border-[#E5E7EB] text-[#6B6B8A] hover:border-[#7B2FF7] hover:text-[#7B2FF7]'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Target audience */}
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Target audience description
            </label>
            <textarea
              {...register('targetAudience' as keyof BrandOnboarding)}
              rows={3}
              placeholder="E.g. Women aged 25–35, interested in skincare, sustainable products, and self-care routines..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 resize-none"
            />
          </div>
        </>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
        style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Setting up profile...
          </>
        ) : (
          <>
            Complete Profile Setup
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}