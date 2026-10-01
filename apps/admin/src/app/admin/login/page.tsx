'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AuthGatewayPage() {
  const router = useRouter();

  // Modes: 'register' (default matching Image 1) | 'login' | 'admin'
  const [mode, setMode] = useState<'register' | 'login' | 'admin'>('register');
  const [step, setStep] = useState<1 | 2>(1);

  // Registration Fields (Step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Registration Fields (Step 2)
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Admin / User Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegisterFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      {/* ============================================================ */}
      {/* 1. RESTAURANT ACCOUNT CREATION (DEFAULT VIEW - MATCHES IMAGE 1) */}
      {/* ============================================================ */}
      {mode === 'register' && (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-secondary mb-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Restaurant SaaS Platform</span>
            </div>
            <h1 className="mt-1 text-[28px] sm:text-[32px] font-bold text-heading tracking-tight">
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
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleRegisterStep1} className="space-y-4">
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
                    onClick={() => setStep(2)}
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
                <form onSubmit={handleRegisterFinal} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-secondary mb-1.5">
                      Restaurant / Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Spice Garden Bistro"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-secondary mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-secondary mb-1.5">
                        City / Location
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-field"
                        placeholder="Bengaluru"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 btn-secondary py-2.5"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 btn-primary py-2.5 flex items-center justify-center space-x-2"
                    >
                      <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t border-border text-center text-xs text-secondary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 2. RESTAURANT USER LOGIN VIEW */}
      {/* ============================================================ */}
      {mode === 'login' && (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-secondary mb-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Restaurant SaaS Platform</span>
            </div>
            <h1 className="mt-1 text-[28px] font-semibold text-heading tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-1 text-[14px] text-secondary">
              Sign in to your restaurant account
            </p>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
            <div className="card p-8 rounded-card space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="name@restaurant.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-border text-center text-xs text-secondary">
                Don't have a restaurant account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 3. SAAS ADMIN PORTAL VIEW (ACCESSIBLE VIA ADMIN LINK) */}
      {/* ============================================================ */}
      {mode === 'admin' && (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-primary mb-4 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SaaS Platform Control Plane</span>
            </div>
            <h1 className="text-[28px] font-semibold text-heading tracking-tight">SaaS Admin Portal</h1>
            <p className="mt-1 text-[14px] text-secondary">Authorized administrators only</p>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
            <div className="card p-8 rounded-card space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="admin@platform.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-medium text-secondary">
                      Password
                    </label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Admin Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Security Notice */}
              <div className="p-3.5 rounded-xl bg-surfaceMuted border border-border text-xs text-secondary flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-heading">Security Notice:</strong> Restricted to authorized SaaS platform administrators. All activities are recorded in the immutable audit log.
                </p>
              </div>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-secondary hover:text-primary font-medium transition"
                >
                  ← Back to Restaurant Account Creation
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DISCREET ADMIN SWITCHER AT VERY BOTTOM */}
      {mode !== 'admin' && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode('admin')}
            className="text-[11px] text-muted hover:text-secondary transition"
          >
            SaaS Platform Staff? Admin Login
          </button>
        </div>
      )}
    </div>
  );
}
