'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from './AuthFlow';

interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  companyName?: string;
  website?: string;
}

interface AccountFormProps {
  role: UserRole;
  onNext: () => void;
}

export default function AccountForm({ role, onNext }: AccountFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>();

  const password = watch('password');

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true);
    // TODO: Backend integration — POST /api/auth/register with role + data
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    toast.success('Account created! Setting up your profile...');
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
            First name <span className="text-[#F357A8]">*</span>
          </label>
          <input
            {...register('firstName', { required: 'First name is required' })}
            type="text"
            placeholder="Sofia"
            className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
              errors.firstName ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
            Last name <span className="text-[#F357A8]">*</span>
          </label>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            type="text"
            placeholder="Chen"
            className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
              errors.lastName ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
          Email address <span className="text-[#F357A8]">*</span>
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
          })}
          type="email"
          placeholder={role === 'brand' ? 'marketing@yourbrand.com' : 'sofia@gmail.com'}
          className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
            errors.email ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Brand-specific field */}
      {role === 'brand' && (
        <>
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Company name <span className="text-[#F357A8]">*</span>
            </label>
            <input
              {...register('companyName', { required: role === 'brand' ? 'Company name is required' : false })}
              type="text"
              placeholder="Glossier, Inc."
              className={`w-full px-4 py-2.5 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
                errors.companyName ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
              }`}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
            )}
          </div>
          <div>
            <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
              Company website
            </label>
            <p className="text-[#9AA0B4] text-xs mb-1.5">Optional — helps us verify your brand</p>
            <input
              {...register('website')}
              type="url"
              placeholder="https://yourbrand.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10"
            />
          </div>
        </>
      )}

      {/* Password */}
      <div>
        <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
          Password <span className="text-[#F357A8]">*</span>
        </label>
        <p className="text-[#9AA0B4] text-xs mb-1.5">At least 8 characters with one uppercase and one number</p>
        <div className="relative">
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Include at least one uppercase letter and one number',
              },
            })}
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
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

      {/* Confirm password */}
      <div>
        <label className="block font-display font-600 text-[#1F1F2E] text-sm mb-1.5">
          Confirm password <span className="text-[#F357A8]">*</span>
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === password || 'Passwords do not match',
            })}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-[#1F1F2E] text-sm placeholder-[#9AA0B4] outline-none transition-all duration-150 focus:border-[#7B2FF7] focus:ring-2 focus:ring-[#7B2FF7]/10 ${
              errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0B4] hover:text-[#6B6B8A] transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <p className="text-[#9AA0B4] text-xs leading-relaxed">
        By creating an account, you agree to our{' '}
        <a href="#terms" className="text-[#7B2FF7] hover:underline">Terms of Service</a> and{' '}
        <a href="#privacy" className="text-[#7B2FF7] hover:underline">Privacy Policy</a>.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="mt-auto w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
        style={{ background: 'linear-gradient(90deg, #7B2FF7, #F357A8)' }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}