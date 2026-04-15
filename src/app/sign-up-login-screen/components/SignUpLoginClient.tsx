'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import AppLogo from '@/src/components/ui/AppLogo';
import { Eye, EyeOff, Copy, Check, ArrowRight, Sparkles, Building2, User, Mail, Lock, Globe, ChevronRight } from 'lucide-react';
// import Icon from '@/components/ui/AppIcon';


type AuthMode = 'login' | 'signup';
type UserRole = 'creator' | 'brand';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  website?: string;
  niche?: string;
  followers?: string;
  agreeTerms: boolean;
}

const demoCredentials = [
  { role: 'Creator', email: 'sofia@viralbridge.io', password: 'creator_demo_2026' },
  { role: 'Brand',   email: 'brand@novaspark.co',  password: 'brand_demo_2026' },
  { role: 'Admin',   email: 'admin@viralbridge.io', password: 'admin_demo_2026' },
];

const niches = ['Beauty & Skincare', 'Fitness & Wellness', 'Food & Cooking', 'Tech & Gadgets', 'Fashion & Style', 'Travel & Adventure', 'Gaming', 'Finance & Investing', 'Parenting', 'Sustainability'];

export default function SignUpLoginClient() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('creator');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', agreeTerms: false } });

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const autofillCredential = (cred: typeof demoCredentials[0]) => {
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    toast.success(`Autofilled ${cred.role} credentials`);
  };

  const onLogin = async (data: LoginForm) => {
    const validCred = demoCredentials.find(c => c.email === data.email && c.password === data.password);
    if (!validCred) {
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      return;
    }
    setIsLoading(true);
    // BACKEND: POST /api/auth/login { email, password } → JWT token
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success(`Welcome back! Signed in as ${validCred.role}`);
    const routes: Record<string, string> = { Creator: '/campaign-discovery', Brand: '/brand-campaign-management', Admin: '/admin-panel' };
    window.location.href = routes[validCred.role] ?? '/campaign-discovery';
  };

  const onSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    // BACKEND: POST /api/auth/signup { ...data, role } → JWT token
    await new Promise(r => setTimeout(r, 1400));
    setIsLoading(false);
    toast.success('Account created! Welcome to ViralBridge.');
    window.location.href = role === 'brand' ? '/brand-campaign-management' : '/campaign-discovery';
  };

  return (
    <div className="min-h-screen flex bg-white">
      <Toaster position="bottom-right" richColors />

      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-purple-800">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-10 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-pink-400 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="text-white font-bold text-xl tracking-tight">ViralBridge</span>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 w-fit">
              <Sparkles size={12} />
              <span>The #1 Influencer Marketing Platform</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Where Brands Meet<br />
              <span className="text-amber-400">Top Creators</span>
            </h1>
            <p className="text-violet-200 text-lg leading-relaxed mb-8">
              Launch campaigns, manage collaborations, and pay creators — all from one powerful platform.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '48K+', label: 'Active Creators' },
                { value: '$12M+', label: 'Paid to Creators' },
                { value: '3,200+', label: 'Brands' },
              ].map((stat) => (
                <div key={`stat-${stat.label}`} className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-white font-bold text-xl tabular-nums">{stat.value}</p>
                  <p className="text-violet-300 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-white/90 text-sm italic leading-relaxed mb-3">
              &ldquo;ViralBridge helped us run 14 campaigns in Q1 with verified creators. Our ROAS went up 3.2x.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-amber-900 text-xs font-bold">KR</span>
              </div>
              <div>
                <p className="text-white text-xs font-medium">Kavya Reddy</p>
                <p className="text-violet-300 text-xs">CMO, Luminary Skincare</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 overflow-y-auto scrollbar-thin">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-bold text-slate-800 text-lg">ViralBridge</span>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={`mode-${m}`}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  mode === m ? 'bg-white text-slate-800 shadow-card' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-700 mb-2">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'creator', label: 'Content Creator', desc: 'Apply to campaigns & earn', Icon: User },
                  { value: 'brand',   label: 'Brand / Business', desc: 'Post campaigns & hire creators', Icon: Building2 },
                ] as const).map(({ value, label, desc, Icon }) => (
                  <button
                    key={`role-${value}`}
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                      role === value
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Icon size={20} className={role === value ? 'text-violet-600 mb-2' : 'text-slate-400 mb-2'} />
                    <p className={`text-sm font-semibold ${role === value ? 'text-violet-700' : 'text-slate-700'}`}>{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-5">Sign in to your ViralBridge account</p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="login-email">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${
                      loginForm.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                    {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">Password</label>
                  <button type="button" className="text-xs text-violet-600 hover:text-violet-700 font-medium">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${
                      loginForm.formState.errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
                    }`}
                    {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-violet-600" {...loginForm.register('remember')} />
                <label htmlFor="remember" className="text-sm text-slate-600">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
                ) : (
                  <><span>Sign In</span><ArrowRight size={16} /></>
                )}
              </button>

              {/* Demo credentials */}
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">Demo Accounts — click to autofill</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {demoCredentials.map((cred) => (
                    <div key={`demo-${cred.role}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          cred.role === 'Creator' ? 'bg-violet-100 text-violet-700' :
                          cred.role === 'Brand'? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>{cred.role}</span>
                        <span className="text-xs text-slate-500 font-mono">{cred.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(cred.email, `${cred.role}-email`)}
                          className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                          title="Copy email"
                        >
                          {copiedField === `${cred.role}-email` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => autofillCredential(cred)}
                          className="text-xs font-medium text-violet-600 hover:text-violet-700 px-2 py-1 rounded hover:bg-violet-50 transition-colors flex items-center gap-1"
                        >
                          Use <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                {role === 'creator' ? 'Join as a Creator' : 'Register Your Brand'}
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                {role === 'creator' ? 'Discover campaigns and start earning today.' : 'Post campaigns and find the perfect creators.'}
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-name">
                  {role === 'creator' ? 'Full Name' : 'Brand / Company Name'}
                </label>
                <div className="relative">
                  {role === 'creator' ? <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /> : <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                  <input
                    id="signup-name"
                    type="text"
                    placeholder={role === 'creator' ? 'Sofia Martinez' : 'NovaSpark Co.'}
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${signupForm.formState.errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...signupForm.register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                  />
                </div>
                {signupForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-email">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${signupForm.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                  />
                </div>
                {signupForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
              </div>

              {/* Creator-specific fields */}
              {role === 'creator' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-niche">Primary Niche</label>
                  <p className="text-xs text-slate-400 mb-1.5">Select the content category you primarily create in</p>
                  <select
                    id="signup-niche"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
                    {...signupForm.register('niche')}
                  >
                    <option value="">Select your niche...</option>
                    {niches.map(n => <option key={`niche-${n}`} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              {/* Brand-specific fields */}
              {role === 'brand' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-website">Company Website</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="signup-website"
                      type="url"
                      placeholder="https://yourbrand.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      {...signupForm.register('website')}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-password">Password</label>
                <p className="text-xs text-slate-400 mb-1.5">At least 8 characters with a number</p>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${signupForm.formState.errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signup-confirm">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors ${signupForm.formState.errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 accent-violet-600 mt-0.5"
                  {...signupForm.register('agreeTerms', { required: 'You must agree to the terms' })}
                />
                <label htmlFor="agree" className="text-sm text-slate-600">
                  I agree to the{' '}
                  <span className="text-violet-600 hover:underline cursor-pointer font-medium">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-violet-600 hover:underline cursor-pointer font-medium">Privacy Policy</span>
                </label>
              </div>
              {signupForm.formState.errors.agreeTerms && <p className="text-red-500 text-xs">{signupForm.formState.errors.agreeTerms.message}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating account...</span></>
                ) : (
                  <><span>Create {role === 'creator' ? 'Creator' : 'Brand'} Account</span><ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-violet-600 hover:text-violet-700 font-medium">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}