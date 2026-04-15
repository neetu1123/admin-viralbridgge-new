'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';


interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    // TODO: Backend integration — POST /api/auth/login
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);

    // Mock credential validation
    if (data.email !== 'demo@viralbridgge.io' || data.password !== 'VB_demo2026!') {
      setError('email', {
        message: 'Invalid credentials — use the demo accounts below to sign in',
      });
      toast.error('Sign-in failed. Check your credentials and try again.');
      return;
    }

    toast.success('Welcome back! Redirecting to your dashboard...');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Email */}
      <div>
        <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
          Email address <span className="text-[#F357A8]">*</span>
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+₹/, message: 'Enter a valid email address' },
          })}
          type="email"
          placeholder="your@email.com"
          className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ₹{
            errors.email ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-display font-600 text-[#1F1F2E] text-sm">
            Password <span className="text-[#F357A8]">*</span>
          </label>
          <a href="#forgot" className="text-[#7B2FF7] text-xs font-medium hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            {...register('password', { required: 'Password is required' })}
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ₹{
              errors.password ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0B4] hover:text-[#6B6B8A] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2.5">
        <input
          {...register('remember')}
          type="checkbox"
          id="remember-me"
          className="w-4 h-4 rounded border-[#E5E7EB] accent-[#7B2FF7] cursor-pointer"
        />
        <label htmlFor="remember-me" className="text-[#6B6B8A] text-sm cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
        style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}