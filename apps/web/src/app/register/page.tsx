'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Building,
} from 'lucide-react';
import { BusinessType } from '@platform/types';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const { setProfile, setBusinessType, setSession } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: User Account Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Restaurant Registration Fields
  const [restaurantName, setRestaurantName] = useState('');
  const [businessType, setBType] = useState<BusinessType>('RESTAURANT');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  const businessTypes: Array<{ type: BusinessType; name: string; icon: string }> = [
    { type: 'RESTAURANT', name: 'Restaurant', icon: '🍽️' },
    { type: 'CAFE', name: 'Cafe', icon: '☕' },
    { type: 'BAKERY', name: 'Bakery', icon: '🥐' },
    { type: 'FAST_FOOD', name: 'Fast Food', icon: '🍔' },
    { type: 'CLOUD_KITCHEN', name: 'Cloud Kitchen', icon: '🛵' },
    { type: 'FOOD_COURT' as any, name: 'Food Court', icon: '🏬' },
    { type: 'HOTEL_RESTAURANT' as any, name: 'Hotel Restaurant', icon: '🏨' },
    { type: 'BAR', name: 'Bar', icon: '🍸' },
    { type: 'CUSTOM' as any, name: 'Other', icon: '✨' },
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          restaurantName,
          businessType,
          phone,
          address,
          city,
          state,
          country,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register restaurant.');
      }

      setBusinessType(businessType);
      setProfile({
        id: `prof-${data.tenantId}`,
        tenantId: data.tenantId,
        businessName: restaurantName,
        phone,
        email,
        city,
        state,
        address,
        country,
        currencyCode: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSession({
        userId: data.userId || `user-${data.tenantId}`,
        tenantId: data.tenantId,
        email,
        fullName,
        roleName: 'OWNER',
        permissions: ['*'],
        deviceId: 'dev-terminal-01',
        isSuperAdmin: false,
      });

      if (data.tenant) {
        try {
          localStorage.setItem('saas_active_tenant', JSON.stringify(data.tenant));
        } catch {}
      }

      if (data.tenant?.slug) {
        router.push(`/${data.tenant.slug}/dashboard`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google authentication');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-secondary hover:text-heading transition">
          <Store className="w-4 h-4 text-primary" />
          <span>Restaurant SaaS Platform</span>
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold text-heading tracking-tight">
          {step === 1 ? 'Create Your Restaurant Account' : 'Register Your Restaurant'}
        </h1>
        <p className="mt-1 text-[14px] text-secondary">
          {step === 1
            ? 'Step 1 of 2: Administrator & Owner Credentials'
            : 'Step 2 of 2: Restaurant Business Details'}
        </p>

        {/* Step Progress indicators */}
        <div className="flex justify-center items-center space-x-2 mt-4">
          <span
            className={`w-8 h-1.5 rounded-full transition-all ${
              step === 1 ? 'bg-primary' : 'bg-primary/40'
            }`}
          />
          <span
            className={`w-8 h-1.5 rounded-full transition-all ${
              step === 2 ? 'bg-primary' : 'bg-border'
            }`}
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="card p-8 rounded-card space-y-6">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-secondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-secondary mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="owner@yourrestaurant.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 btn-primary py-2.5 flex items-center justify-center space-x-2"
              >
                <span>Continue to Restaurant Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-muted">Or authenticate with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full btn-secondary py-2.5 flex items-center justify-center space-x-2 text-sm"
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
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-secondary mb-1.5">
                  Restaurant Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="e.g. Royal Tandoor & Grill"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-secondary mb-1.5">
                  Business Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {businessTypes.map((bt) => (
                    <button
                      key={bt.name}
                      type="button"
                      onClick={() => setBType(bt.type)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 text-xs ${
                        businessType === bt.type
                          ? 'bg-primary-light border-primary text-primary font-semibold'
                          : 'bg-surface border-border text-secondary hover:bg-surfaceMuted'
                      }`}
                    >
                      <span className="text-base">{bt.icon}</span>
                      <span className="truncate">{bt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-secondary mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="Street / Area / Landmark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-1/3 btn-secondary flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 btn-primary py-2.5 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Registering in DB...</span>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center text-xs text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
