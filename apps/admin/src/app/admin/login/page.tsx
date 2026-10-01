'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 250);
  };

  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-secondary mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}
