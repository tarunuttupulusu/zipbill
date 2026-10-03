'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Store,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { BusinessType } from '@platform/types';
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/permission-engine';
import { supabase } from '@/lib/supabase';
import { ZipBillLogo } from '@/components/brand/ZipBillLogo';

const VIDEO_URL =
  'https://res.cloudinary.com/dvueuxjap/video/upload/v1790946122/From_Klickpin.com-_Try_Beautiful_bridal_shower_themes_for_your_next_inspiration_board_with_thoughtful_touches_that_make_everything_feel_complete-p_mry7y4.mp4';

const businessTypes: Array<{ type: BusinessType; name: string }> = [
  { type: 'RESTAURANT', name: 'Restaurant' },
  { type: 'CAFE', name: 'Cafe' },
  { type: 'BAKERY', name: 'Bakery' },
  { type: 'FAST_FOOD', name: 'Fast Food' },
  { type: 'CLOUD_KITCHEN', name: 'Cloud Kitchen' },
  { type: 'HOTEL_RESTAURANT' as any, name: 'Hotel' },
];

export function AuthSplitCard({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
  const router = useRouter();
  const { session, setSession, setProfile, setBusinessType, setCurrentTenant } = useApp();

  // Mode: 'login' or 'register' - switches in-place in this exact section!
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Common & Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Register State
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [bType, setBType] = useState<BusinessType>('RESTAURANT');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [existingUser, setExistingUser] = useState<any>(null);
  const [existingTenant, setExistingTenant] = useState<any>(null);

  // Check if user already has an active authenticated session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = localStorage.getItem('saas_active_session');
      const savedTenant = localStorage.getItem('saas_active_tenant');
      const savedProfile = localStorage.getItem('saas_active_profile');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (
          parsed.userId === 'usr-owner-01' ||
          parsed.email === 'owner@restaurant.pos' ||
          parsed.email?.startsWith('test-') ||
          parsed.email?.includes('example.com') ||
          parsed.fullName?.includes('Dynamic Owner') ||
          parsed.fullName?.includes('Test') ||
          parsed.tenantId === 'b89ad650-7510-4159-819b-2adb49642c18'
        ) {
          localStorage.removeItem('saas_active_session');
          localStorage.removeItem('saas_active_profile');
          localStorage.removeItem('saas_active_tenant');
          setExistingUser(null);
          return;
        }
        if (parsed?.userId && parsed?.email) {
          setExistingUser(parsed);
          if (savedTenant) {
            try {
              setExistingTenant(JSON.parse(savedTenant));
            } catch {}
          } else if (savedProfile) {
            try {
              const p = JSON.parse(savedProfile);
              setExistingTenant({ name: p.businessName, slug: '' });
            } catch {}
          }
        }
      }
    } catch {}
  }, []);

  const handleLogoutExisting = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    localStorage.removeItem('saas_active_session');
    localStorage.removeItem('saas_active_profile');
    localStorage.removeItem('saas_active_tenant');
    localStorage.removeItem('saas_active_business_type');
    setSession({
      userId: '',
      tenantId: '',
      email: '',
      fullName: '',
      roleName: 'OWNER',
      permissions: ['*'],
      deviceId: 'dev-terminal-01',
      isSuperAdmin: false,
    });
    setExistingUser(null);
    setExistingTenant(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || data.error || 'Invalid email or password. Please try again.');
        return;
      }

      if (data.status === 'PENDING_APPROVAL') {
        router.push('/pending-approval');
        return;
      }

      const activeProfile = data.profile || (data.tenant ? {
        id: `prof-${data.tenant.id}`,
        tenantId: data.tenant.id,
        businessName: data.tenant.name,
        phone: data.user.phone || '',
        email: data.user.email,
        city: data.profile?.city || 'Bengaluru',
        state: data.profile?.state || 'Karnataka',
        address: data.profile?.address || '',
        country: 'IN',
        currencyCode: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        onboardingCompleted: data.onboardingCompleted ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } : null);

      if (activeProfile) {
        setProfile(activeProfile);
        try {
          localStorage.setItem('saas_active_profile', JSON.stringify(activeProfile));
        } catch {}
      }

      if (data.tenant?.businessType) {
        setBusinessType(data.tenant.businessType);
      }

      if (data.tenant) {
        setCurrentTenant(data.tenant);
        try {
          localStorage.setItem('saas_active_tenant', JSON.stringify(data.tenant));
        } catch {}
      }

      const activeSessionObj = {
        ...session,
        tenantId: data.user.tenantId || data.tenant?.id || session.tenantId,
        fullName: data.user.fullName,
        email: data.user.email,
        roleName: data.user.roleType,
        permissions: data.permissions || ROLE_DEFAULT_PERMISSIONS[data.user.roleType] || ['*'],
        userId: data.user.id,
      };

      setSession(activeSessionObj);
      try {
        localStorage.setItem('saas_active_session', JSON.stringify(activeSessionObj));
      } catch {}

      if (data.redirect) {
        router.push(data.redirect);
      } else if (!data.onboardingCompleted) {
        router.push(`/onboarding?tenantId=${data.tenant?.id || ''}&email=${encodeURIComponent(data.user.email)}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify your password.');
      return;
    }
    setAuthError(null);
    setRegisterStep(2);
  };

  const handleRegisterFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          restaurantName,
          businessType: bType,
          phone,
          city: city || 'Bengaluru',
          country: 'India',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register restaurant.');
      }

      // Save pending registration details so user can monitor approval state
      try {
        localStorage.setItem(
          'saas_pending_registration',
          JSON.stringify({
            tenantId: data.tenantId,
            restaurantName,
            email,
            phone,
            city: city || 'Bengaluru',
            businessType: bType,
            submittedAt: new Date().toISOString(),
          })
        );
      } catch {}

      // Clear any active sessions so user cannot bypass approval
      localStorage.removeItem('saas_active_session');
      localStorage.removeItem('saas_active_profile');
      localStorage.removeItem('saas_active_tenant');

      // Route immediately to Pending Approval screen
      router.push(`/pending-approval?tenantId=${data.tenantId}&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to initiate Google authentication');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] md:h-screen w-full md:max-h-screen md:overflow-hidden overflow-y-auto bg-[#FAFAF8] text-[#1C1917] flex items-center justify-center p-3 sm:p-5 lg:p-6 font-sans relative">
      {/* Subtle ambient glow matching ZipBill warm tones */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-orange-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#EA580C_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      {/* Main Split Card - Mobile: compact banner + form, Desktop: full split card */}
      <div className="relative w-full max-w-[480px] md:max-w-[990px] bg-white rounded-2xl sm:rounded-3xl border border-[#E8E6E4] shadow-[0_20px_50px_-15px_rgba(28,25,23,0.07),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row md:h-[min(630px,94vh)] my-auto">
        
        {/* LEFT / TOP SIDE: Video Animation - Generously sized banner on mobile, full-height on desktop */}
        <div className="w-full md:w-1/2 h-64 sm:h-72 md:h-full p-2.5 sm:p-3.5 shrink-0 flex flex-col">
          <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-900 group shadow-inner">
            <video
              src={VIDEO_URL}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* RIGHT / BOTTOM SIDE: Interactive Auth Form (Always visible & accessible) */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-5 sm:p-7 md:py-7 md:pl-10 md:pr-8 lg:pl-12 lg:pr-10 overflow-y-auto">
          
          {/* Top Bar: Brand Logo & In-Place Segmented Mode Switch */}
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-90 transition">
              <ZipBillLogo size="sm" variant="full" />
            </Link>

            {/* Seamless In-Place Tab Switch: Sign In vs Register */}
            <div className="inline-flex p-0.5 bg-[#F7F7F5] border border-[#E8E6E4] rounded-full text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                }}
                className={`px-3 py-1 rounded-full font-semibold transition-all text-[11px] cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep(1);
                  setAuthError(null);
                }}
                className={`px-3 py-1 rounded-full font-semibold transition-all text-[11px] cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#EA580C] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="my-auto py-2">
            
            {/* -------------------- SIGN IN MODE -------------------- */}
            {mode === 'login' && (
              <div className="space-y-3.5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
                    Welcome Back
                  </h1>
                </div>

                {/* Existing Active Session Alert */}
                {existingUser && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 space-y-1.5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-[11px] truncate max-w-[170px]">{existingUser.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoutExisting}
                        className="text-red-600 font-semibold hover:underline cursor-pointer text-[11px]"
                      >
                        Switch
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (existingTenant?.slug) {
                          router.push(`/${existingTenant.slug}/dashboard`);
                        } else {
                          router.push('/dashboard');
                        }
                      }}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-center flex items-center justify-center space-x-1 text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <span>Continue to Dashboard</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* 1. Quick Social Authentication at the Top */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-4 bg-white hover:bg-[#F9F9F8] text-[#1C1917] text-xs font-semibold rounded-xl border border-[#E8E6E4] hover:border-[#D1D5DB] shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-70"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider with Increased Distance */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-[#E8E6E4] w-full" />
                  <span className="bg-white px-2.5 text-[10px] uppercase tracking-wider text-[#A8A29E] font-medium absolute">
                    or continue with email
                  </span>
                </div>

                {/* 2. Login Form */}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1C1917]">
                      Work Email
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="name@restaurant.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-[#1C1917]">
                        Password
                      </label>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('To reset your password, please contact support or sign in with Google.');
                        }}
                        className="text-xs text-[#EA580C] hover:text-[#C2410C] font-medium hover:underline transition-colors"
                      >
                        Forgot?
                      </a>
                    </div>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#565656] cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-1.5 animate-fadeIn">
                      <span className="font-semibold">Error:</span>
                      <span className="leading-tight">{authError}</span>
                    </div>
                  )}

                  {/* 3. Primary CTA Button concluding the form */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Restaurant'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* -------------------- REGISTER MODE -------------------- */}
            {mode === 'register' && registerStep === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
                    Start Your 14-Day Free Trial
                  </h1>
                </div>

                {/* 1. Quick Social Authentication at the Top */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-4 bg-white hover:bg-[#F9F9F8] text-[#1C1917] text-xs font-semibold rounded-xl border border-[#E8E6E4] hover:border-[#D1D5DB] shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-70"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider with Increased Distance */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-[#E8E6E4] w-full" />
                  <span className="bg-white px-2.5 text-[10px] uppercase tracking-wider text-[#A8A29E] font-medium absolute">
                    or register with email
                  </span>
                </div>

                {/* 2. Registration Form */}
                <form onSubmit={handleRegisterStep1} className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1C1917]">
                      Full Name
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="Your Full Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1C1917]">
                      Work Email
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="owner@yourrestaurant.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917]">
                        Password
                      </label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-2 sm:py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917]">
                        Confirm
                      </label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-2 sm:py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{authError}</span>
                    </div>
                  )}

                  {/* 3. Primary CTA Button concluding the form */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
                  >
                    <span>Continue to Restaurant Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* -------------------- REGISTER STEP 2 -------------------- */}
            {mode === 'register' && registerStep === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="p-1 hover:bg-[#F7F7F5] rounded-lg text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-lg sm:text-xl font-bold text-[#1C1917] tracking-tight">
                    Restaurant Details
                  </h1>
                </div>

                <form onSubmit={handleRegisterFinal} className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1C1917]">
                      Restaurant / Brand Name
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E] group-focus-within:text-[#EA580C] transition-colors">
                        <Store className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="e.g. Spice Route Kitchen"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#1C1917]">
                      Business Type
                    </label>
                    <select
                      value={bType}
                      onChange={(e) => setBType(e.target.value as BusinessType)}
                      className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                    >
                      {businessTypes.map((bt) => (
                        <option key={bt.type} value={bt.type}>
                          {bt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 sm:py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917]">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 sm:py-1.5 bg-[#FFFFFF] border border-[#E8E6E4] hover:border-[#D1D5DB] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all"
                        placeholder="Bengaluru"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Switcher Link */}
          <div className="pt-3 pb-1 border-t border-[#E8E6E4] text-center text-xs text-[#78716C]">
            {mode === 'login' ? (
              <span>
                Don&apos;t have a restaurant account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegisterStep(1);
                    setAuthError(null);
                  }}
                  className="text-[#EA580C] font-semibold hover:underline cursor-pointer touch-manipulation"
                >
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthError(null);
                  }}
                  className="text-[#EA580C] font-semibold hover:underline cursor-pointer touch-manipulation"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
