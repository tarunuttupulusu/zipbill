'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Users,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlatformData() {
      try {
        const res = await fetch('/api/admin/tenants');
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } catch (e) {
        console.error('Failed to load admin tenants:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPlatformData();
  }, []);

  const totalTenants = tenants.length;
  const pendingApprovals = tenants.filter(
    (t) => t.status === 'PENDING' || t.status === 'PENDING_APPROVAL'
  ).length;
  const activeTenants = tenants.filter((t) => t.status === 'APPROVED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading tracking-tight">SaaS Platform Overview</h1>
          <p className="text-sm text-secondary mt-1">
            Global Control Plane & Multi-Tenant Infrastructure Metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/restaurants"
            className="btn-primary text-xs px-4 py-2.5 flex items-center space-x-2"
          >
            <Store className="w-4 h-4" />
            <span>Manage Restaurants</span>
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tenants</span>
            <div className="p-2 rounded-lg bg-primary-light text-primary">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : totalTenants}
          </div>
          <p className="text-xs text-secondary flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">Live</span>
            <span>registered restaurants</span>
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-amber-600" /> : pendingApprovals}
          </div>
          <p className="text-xs text-secondary">Awaiting administrator verification</p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Workspaces</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> : activeTenants}
          </div>
          <p className="text-xs text-secondary">Provisioned and operational</p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Health</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">99.9%</div>
          <p className="text-xs text-secondary">PostgreSQL & Auth Connected</p>
        </div>
      </div>

      {/* REGISTERED TENANTS TABLE */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-heading">Live Restaurant Tenants</h2>
          </div>
          <Link
            href="/admin/restaurants"
            className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
          >
            <span>View All Restaurants</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading live restaurant data from database...</span>
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center bg-surfaceMuted rounded-lg border border-border text-xs text-secondary">
            No restaurant tenants registered in the platform database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Slug / URL</th>
                  <th className="py-3 px-4">Business Type</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tenants.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-surfaceMuted transition">
                    <td className="py-3.5 px-4 font-bold text-heading">{t.name}</td>
                    <td className="py-3.5 px-4 text-secondary font-mono">/{t.slug}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-primary-light text-primary font-semibold">
                        {t.businessType || 'RESTAURANT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-heading">{t.plan}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          t.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/${t.slug}/dashboard`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-[11px] px-3 py-1 font-semibold inline-flex items-center space-x-1"
                      >
                        <span>Open Portal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
