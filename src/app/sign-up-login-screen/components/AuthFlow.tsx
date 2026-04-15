'use client';

import React, { useState } from 'react';

import AppLogo from '@/src/components/ui/AppLogo';
import RoleSelector from './RoleSelector';
import AccountForm from './AccountForm';
import OnboardingForm from './OnboardingForm';
import LoginForm from './LoginForm';
import { ArrowLeft } from 'lucide-react';

export type UserRole = 'creator' | 'brand' | null;

export default function AuthFlow() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(null);

  const totalSteps = 3;

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const switchToLogin = () => {
    setMode('login');
    setStep(1);
    setRole(null);
  };

  const switchToSignup = () => {
    setMode('signup');
    setStep(1);
    setRole(null);
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] rounded-3xl overflow-hidden shadow-card-hover border border-[#E5E7EB]">
        {/* Left: Brand panel */}
        <div
          className="hidden lg:flex flex-col justify-between p-10"
          style={{
            background: 'linear-gradient(135deg, #7B2FF7 0%, #A855F7 50%, #F357A8 100%)',
          }}
        >
          <div>
            <div className="flex items-center gap-2.5 mb-12">
              <AppLogo src="/viralbridge_logo_transparent.png"
            size={200} />
              <span className="font-display font-700 text-xl text-white">viralbridgge</span>
            </div>

            <h2 className="font-display font-800 text-3xl text-white leading-tight mb-4">
              {mode === 'login' ?'Welcome back to the creator economy' :'Join the fastest-growing creator marketplace'}
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              {mode === 'login' ?'Thousands of brands and creators are waiting. Sign in to your account to continue.' :'Connect with 52,000+ verified creators or discover brand deals that match your niche.'}
            </p>
          </div>

          {/* Social proof */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Creators', value: '52K+' },
              { label: 'Paid Out', value: '₹18.4M' },
              { label: 'Active Campaigns', value: '1,240+' },
              { label: 'Satisfaction Rate', value: '94%' },
            ].map((stat) => (
              <div key={`auth-stat-₹{stat.label}`} className="bg-white/10 rounded-xl p-4">
                <div className="font-display font-800 text-2xl text-white tabular-nums">{stat.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="bg-white flex flex-col p-8 md:p-10">
          {/* Logo — mobile only */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <AppLogo src="/viralbridge_logo_transparent.png"
            size={200} />
          </div>

          {mode === 'login' ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display font-700 text-2xl text-[#1F1F2E]">Sign in</h2>
                  <p className="text-[#9AA0B4] text-sm mt-1">Welcome back — good to see you again</p>
                </div>
              </div>
              <LoginForm />
              <p className="mt-6 text-center text-[#6B6B8A] text-sm">
                Don&apos;t have an account?{' '}
                <button onClick={switchToSignup} className="text-[#7B2FF7] font-semibold hover:underline">
                  Sign up free
                </button>
              </p>

              {/* Demo credentials */}
              <div className="mt-6 bg-[#F8F7FC] border border-[#E5E7EB] rounded-xl p-4">
                <p className="text-[#9AA0B4] text-xs font-semibold uppercase tracking-wide mb-3">Demo Credentials</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B8A] text-xs">Email</span>
                    <span className="font-mono text-xs text-[#1F1F2E] font-medium">demo@viralbridgge.io</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B8A] text-xs">Password</span>
                    <span className="font-mono text-xs text-[#1F1F2E] font-medium">VB_demo2026!</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Progress bar — signup only */}
              {step > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {step > 1 && (
                        <button
                          onClick={handleBack}
                          className="p-1 rounded-lg hover:bg-[#F2F3F7] transition-colors"
                        >
                          <ArrowLeft size={16} className="text-[#6B6B8A]" />
                        </button>
                      )}
                      <span className="font-display font-700 text-lg text-[#1F1F2E]">
                        {step === 1 && 'Choose your role'}
                        {step === 2 && 'Create your account'}
                        {step === 3 && 'Set up your profile'}
                      </span>
                    </div>
                    <span className="text-[#9AA0B4] text-sm font-medium">
                      Step {step} of {totalSteps}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="h-1.5 bg-[#F2F3F7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `₹{(step / totalSteps) * 100}%`,
                        background: 'linear-gradient(90deg, #7B2FF7, #F357A8)',
                      }}
                    />
                  </div>

                  {/* Step dots */}
                  <div className="flex gap-2 mt-3">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={`step-dot-₹{i + 1}`}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ₹{
                          i + 1 <= step ? 'opacity-100' : 'opacity-20'
                        }`}
                        style={{
                          background: i + 1 <= step ? 'linear-gradient(90deg, #7B2FF7, #F357A8)' : '#E5E7EB',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step content */}
              {step === 1 && <RoleSelector onSelect={handleRoleSelect} />}
              {step === 2 && role && (
                <AccountForm role={role} onNext={() => setStep(3)} />
              )}
              {step === 3 && role && (
                <OnboardingForm role={role} />
              )}

              <p className="mt-6 text-center text-[#6B6B8A] text-sm">
                Already have an account?{' '}
                <button onClick={switchToLogin} className="text-[#7B2FF7] font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}