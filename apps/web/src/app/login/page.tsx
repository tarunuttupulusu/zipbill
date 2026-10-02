'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/permission-engine';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { session, setSession, setProfile, setBusinessType, setCurrentTenant } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [existingUser, setExistingUser] = useState<any>(null);
  const [existingTenant, setExistingTenant] = useState<any>(null);
  const [showLoginAnyway, setShowLoginAnyway] = useState(false);

  // Check if user already has an active authenticated session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = localStorage.getItem('saas_active_session');
      const savedTenant = localStorage.getItem('saas_active_tenant');
      const savedProfile = localStorage.getItem('saas_active_profile');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Automatically purge any dummy/test sessions so real users are never trapped in test accounts
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

  const handleLogoutExisting = () => {
    localStorage.removeItem('saas_active_session');
    localStorage.removeItem('saas_active_profile');
    localStorage.removeItem('saas_active_tenant');
    setExistingUser(null);
    setExistingTenant(null);
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || data.error || 'Invalid email or password. Please try again.');
        return;
      }

      if (data.status === 'PENDING_APPROVAL') {
        router.push('/pending-approval');
        return;
      }

      // Update real session, profile, and business type from database
      if (data.profile) {
        setProfile(data.profile);
      } else if (data.tenant) {
        setProfile({
          id: `prof-${data.tenant.id}`,
          tenantId: data.tenant.id,
          businessName: data.tenant.name,
          phone: '',
          email: data.user.email,
          city: 'Bengaluru',
          state: 'Karnataka',
          address: '',
          country: 'IN',
          currencyCode: 'INR',
          currencySymbol: '₹',
          timezone: 'Asia/Kolkata',
          onboardingCompleted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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

      setSession({
        ...session,
        tenantId: data.user.tenantId || data.tenant?.id || session.tenantId,
        fullName: data.user.fullName,
        email: data.user.email,
        roleName: data.user.roleType,
        permissions: data.permissions || ROLE_DEFAULT_PERMISSIONS[data.user.roleType] || ['*'],
        userId: data.user.id,
      });

      if (data.redirect) {
        router.push(data.redirect);
      } else if (data.tenant?.slug) {
        router.push(`/${data.tenant.slug}/dashboard`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Unable to connect. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setLoginError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to initiate Google authentication');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-secondary hover:text-heading transition">
          <Store className="w-4 h-4 text-primary" />
          <span>Restaurant Platform</span>
        </Link>
        <h1 className="mt-3 text-[28px] font-semibold text-heading tracking-tight">Welcome Back</h1>
        <p className="mt-1 text-[14px] text-secondary">Sign in to your restaurant account</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {existingUser && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Currently signed in as {existingUser.email}</span>
              </div>
              <button
                type="button"
                onClick={handleLogoutExisting}
                className="text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
            {existingTenant?.name && (
              <p className="text-secondary text-[11px]">Restaurant: {existingTenant.name}</p>
            )}
            <button
              type="button"
              onClick={() => {
                if (existingTenant?.slug) {
                  router.push(`/${existingTenant.slug}/dashboard`);
                } else {
                  router.push('/dashboard');
                }
              }}
              className="w-full mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-center flex items-center justify-center space-x-1.5 transition"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="card p-8 rounded-card space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-heading mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-placeholder" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field input-with-icon"
                  placeholder="name@restaurant.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-heading">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-placeholder" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field input-with-icon"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2 font-semibold text-sm shadow-button hover:shadow-button-hover"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Restaurant'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider & Google Auth at Bottom */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-secondary font-medium tracking-wider">
                or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full btn-secondary py-3 flex items-center justify-center space-x-2.5 text-sm font-semibold hover:bg-surfaceMuted transition shadow-xs border border-border"
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

          <div className="pt-4 border-t border-border text-center text-xs text-secondary">
            Don't have a restaurant account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
